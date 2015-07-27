---
layout: post
title:  "Re-writing MySQL Queries with MySQL Proxy"
date:   2014-06-27
categories: mysql tech
---

# The Problem

Recently I was faced with an issue where a VIP customer on a legacy application was causing horribly inefficient queries. Trying to work with the customer to change their use case was leading us nowhere, and there is no current development effort on this application so fixing the code was not an option. These queries were causing slowness and were putting that application in very high danger of an outage. What to do?

# The Solution

We tried various things that all helped a little, adding some more hardware, a bit of tuning specific to that customer, cleaning up old data. But none of that was enough, it was time to try something a bit more out of the ordinary. We knew this whole time that there was one specific query that was causing full table scans and filesorts, and this query could easily be fixed by removing a forced index that the application was adding. What we didn’t know is that there was something we could do about it without needing a code change, enter MySQL Proxy.

MySQL Proxy is a highly flexible proxy that sits inbetween the client and the database and can monitor or manipulate traffic as it passes through. This sounds like the perfect solution, except that it is alpha software and has been since 2007.

But we were running out of options, so we took a bit of a risk and decided to implement MySQL Proxy inbetween our application and the database to rewrite specific queries. And it has been working really well! It handles around 5 million queries a day, modifying only .1% of them.

# Implementation

Since MySQL proxy is not meant for production just yet, we wanted to make sure we could handle a situation where it crashed. So we decided to put HAProxy infront of MySQL proxy, configured to pass traffic through straight to the database if the proxy is down. This is what the solution looks like:

![MysqlProxy](/images/2014-06-27-Re-writing-MySQL-Queries-with-MySQL-Proxy/mysqlproxy.png)

# HAProxy Configuration 
(Note: we are using a xinetd script provided by Unai Rodriguez for healthchecks on the proxy, information on that can be found here):

~~~
global
log 127.0.0.1 local1 debug
maxconn 4096
chroot /usr/share/haproxy
group haproxy
daemon

defaults
log global
mode http
option tcplog
retries 3
option redispatch
maxconn 2000
contimeout 200
clitimeout 50000
srvtimeout 50000

#Frontend, go to the proxy unless it is down.
frontend mysql_proxy-front
bind *:3308
mode tcp
acl use_mysql_when_proxy_down nbsrv(mysql_proxy-back) lt 1
use_backend mysql-back if use_mysql_when_proxy_down
default_backend mysql_proxy-back

#Backend for pass through straight to mysql
#Don't need to do any checks on the database, if it is down there is nothing else to do
backend mysql-back
mode tcp
balance leastconn
server mysql 10.10.106.16:3306

#Backend to MySQL Proxy. Checks status via xinetd script running on port 9200
backend mysql_proxy-back
mode tcp
balance leastconn
option httpchk
server proxy 10.10.106.16:3308 check port 9200 inter 1000 rise 3 fall 3
~~~

# MySQL Proxy Configuration
MySQL Proxy uses a single configuration file that specifies what Lua based scripts to use. These scripts are where you define what you want MySQL Proxy to accomplish. In my case, I used two scripts. One script for configuring how to modify queries on the fly, and the other defines a management console which allows me to view some stats about how the proxy is functioning. Both of those scripts were simple modifications of the example scripts found here.

The main configuration file is pretty straight forward, just pointing at the Lua scripts that do the real work.

~~~
[mysql-proxy]
daemon = true
user = root

pid-file = /var/run/mysql-proxy.pid
log-file = /var/log/mysql-proxy.log
log-level = info

proxy-lua-script=/etc/mysql-proxy/proxy.lua
proxy-address = 10.10.106.16:3307
proxy-backend-addresses = 10.10.106.16:3306

admin-password = <admin password>
admin-username = <admin user>
admin-address = 127.0.0.1:4404
admin-lua-script = /etc/mysql-proxy/admin.lua
plugins = admin,proxy
~~~

Here is our proxy.lua script

~~~
--[[

   Copyright 2008, 2010, Oracle and/or its affiliates. All rights reserved.

   This program is free software; you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation; version 2 of the License.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program; if not, write to the Free Software
   Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA

--]]

-- reporter.lua

--[[

    See http://www.chriscalender.com/?p=41
    (Thanks to Chris Calender)
    See http://datacharmer.blogspot.com/2009/01/mysql-proxy-is-back.html
    (Thanks Giuseppe Maxia)

--]]

-- Initialize a total query counter and a modified query counter that the admin console will allow us to read
proxy.global.query_counter = proxy.global.query_counter or 0
proxy.global.idx_removal_counter = proxy.global.idx_removal_counter or 0

-- Initialize the process list for the admin console
function proxy.global.initialize_process_table()
    if proxy.global.process == nil then
        proxy.global.process = {}
    end
    if proxy.global.process[proxy.connection.server.thread_id] == nil then
        proxy.global.process[proxy.connection.server.thread_id] = {}
    end
end

-- Monitors for connections and adds the process_id and start time to the process list
function read_auth_result( auth )
    local state = auth.packet:byte()
    if state == proxy.MYSQLD_PACKET_OK then
        proxy.global.initialize_process_table()
        table.insert( proxy.global.process[proxy.connection.server.thread_id],
            { ip = proxy.connection.client.src.name, ts = os.time() } )
    end
end

-- Remove connection from the process list on disconnect
function disconnect_client()
    local connection_id = proxy.connection.server.thread_id
    if connection_id then
        -- client has disconnected, set this to nil
        proxy.global.process[connection_id] = nil
    end
end

-- This is where you can handle incomming queries.
function read_query( packet )
  
  -- If we got a query, increment the query_counter and check to see if we should modify it
  if string.byte(packet) == proxy.COM_QUERY then
    proxy.global.query_counter = proxy.global.query_counter + 1
    local query = string.sub(packet, 2)

    -- Check to see if the query matches a known slow query and modify it to optimize. In this case we are just removing a bad forced index.
    -- We are making sure the query has a forced index and that it is trying to search on a specific column. In our case that was enough to identify the bad query.
    if string.match(query,"idx_fast") then
      if string.match(query, "problem_column%s*=") then

        -- It matched, so modify the query. In this case we are removing a forced index.
        query = string.gsub(query,"[Uu][Ss][Ee] [Ii][Nn][Dd][Ee][Xx]%([Ii][Dd][Xx]_[Ff][Aa][Ss][Tt]%)",' ')

        -- Add the modified query to the list
        proxy.queries:append(1, string.char(proxy.COM_QUERY) .. query )

        -- Increment the modified query counter
        proxy.global.idx_removal_counter = proxy.global.idx_removal_counter + 1

        -- And send the query along.
        return proxy.PROXY_SEND_QUERY

      end
    end

  end
end
~~~

And the admin.lua script, which has very slight modifications to support the new idx_removal counter.

~~~
--[[

   Copyright 2008, 2010, Oracle and/or its affiliates. All rights reserved.

   This program is free software; you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation; version 2 of the License.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program; if not, write to the Free Software
   Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA

--]]

-- admin.lua

--[[

    See http://www.chriscalender.com/?p=41
    (Thanks to Chris Calender)
    See http://datacharmer.blogspot.com/2009/01/mysql-proxy-is-back.html
    (Thanks Giuseppe Maxia)

--]]

function set_error(errmsg)
    proxy.response = {
        type = proxy.MYSQLD_PACKET_ERR,
        errmsg = errmsg or "error"
    }
end

function read_query(packet)
    if packet:byte() ~= proxy.COM_QUERY then
        set_error("[admin] we only handle text-based queries (COM_QUERY)")
        return proxy.PROXY_SEND_RESULT
    end

    local query = packet:sub(2)
    local rows = { }
    local fields = { }

    -- try to match the string up to the first non-alphanum
    local f_s, f_e, command = string.find(packet, "^%s*(%w+)", 2)
    local option

    if f_e then
            -- if that match, take the next sub-string as option
            f_s, f_e, option = string.find(packet, "^%s+(%w+)", f_e + 1)
    end

    -- we got our commands, execute it
    if command == "show" and option == "querycounter" then
            ---
            -- proxy.PROXY_SEND_RESULT requires
            --
            -- proxy.response.type to be either
            -- * proxy.MYSQLD_PACKET_OK or
            -- * proxy.MYSQLD_PACKET_ERR
            --
            -- for proxy.MYSQLD_PACKET_OK you need a resultset
            -- * fields
            -- * rows
            --
            -- for proxy.MYSQLD_PACKET_ERR
            -- * errmsg
            proxy.response.type = proxy.MYSQLD_PACKET_OK
            proxy.response.resultset = {
                    fields = {
                            { type = proxy.MYSQL_TYPE_LONG, name = "query_counter", },
                    },
                    rows = {
                            { proxy.global.query_counter }
                    }
            }

            -- we have our result, send it back
            return proxy.PROXY_SEND_RESULT
    elseif command == "show" and option == "idxremovalcounter" then
            proxy.response.type = proxy.MYSQLD_PACKET_OK
            proxy.response.resultset = {
                    fields = {
                            { type = proxy.MYSQL_TYPE_LONG, name = "idx_removal_counter", },
                    },
                    rows = {
                            { proxy.global.idx_removal_counter }
                    }
            }

            -- we have our result, send it back
            return proxy.PROXY_SEND_RESULT
    elseif command == "show" and option == "myerror" then
            proxy.response.type = proxy.MYSQLD_PACKET_ERR
            proxy.response.errmsg = "my first error"

            return proxy.PROXY_SEND_RESULT

    elseif string.sub(packet, 2):lower() == 'select help' then
            return show_process_help()

    elseif string.sub(packet, 2):lower() == 'show proxy processlist' then
            return show_process_table()

    elseif query == "SELECT * FROM backends" then
        fields = {
            { name = "backend_ndx",
              type = proxy.MYSQL_TYPE_LONG },

            { name = "address",
              type = proxy.MYSQL_TYPE_STRING },
            { name = "state",
              type = proxy.MYSQL_TYPE_STRING },
            { name = "type",
              type = proxy.MYSQL_TYPE_STRING },
        }

        for i = 1, #proxy.global.backends do
            local b = proxy.global.backends[i]

            rows[#rows + 1] = {
                i, b.dst.name, b.state, b.type
            }
        end
    else
        set_error()
        return proxy.PROXY_SEND_RESULT
    end

    proxy.response = {
        type = proxy.MYSQLD_PACKET_OK,
        resultset = {
            fields = fields,
            rows = rows
        }
    }
    return proxy.PROXY_SEND_RESULT
end

function make_dataset (header, dataset)
    proxy.response.type = proxy.MYSQLD_PACKET_OK

    proxy.response.resultset = {
        fields = {},
        rows = {}
    }
    for i,v in pairs (header) do
        table.insert(proxy.response.resultset.fields, {type = proxy.MYSQL_TYPE_STRING, name = v})
    end
    for i,v in pairs (dataset) do
        table.insert(proxy.response.resultset.rows, v )
    end
    return proxy.PROXY_SEND_RESULT
end

function show_process_table()
    local dataset = {}
    local header = { 'Id', 'IP Address', 'Time' }
    local rows = {}
    for t_i, t_v in pairs (proxy.global.process) do
        for s_i, s_v in pairs ( t_v ) do
            table.insert(rows, { t_i, s_v.ip, os.date('%c',s_v.ts) })
        end
    end
    return make_dataset(header,rows)
end

function show_process_help()
    local dataset = {}
    local header = { 'command',  'description' }
    local rows = {
        {'SELECT HELP',                 'This command.'},
        {'SHOW PROXY PROCESSLIST',      'Show all connections and their true IP Address.'},
    }
    return make_dataset(header,rows)
end

function dump_process_table()
    proxy.global.initialize_process_table()
    print('current contents of process table')
    for t_i, t_v in pairs (proxy.global.process) do
        print ('session id: ', t_i)
        for s_i, s_v in pairs ( t_v ) do
            print ( '\t', s_i, s_v.ip, s_v.ts )
        end
    end
    print ('---END PROCESS TABLE---')
end

--[[    Help

we use a simple string-match to split commands are word-boundaries

mysql> show querycounter

is split into
command = "show"
option  = "querycounter"

spaces are ignored, the case has to be as is.

mysql> show myerror

returns a error-packet

--]]
~~~

Once you have these configs and scripts in place and have started all of the services (HAProxy, MySQL, and MySQL Proxy), you should be able to start running some queries through it and see them modified before they hit MySQL!

To use the admin console, you can simply connect to the admin port (4404 in this example) using a MySQL client . Here are a couple of examples of using the admin console.

~~~
[mjknox@database ~]# mysql -u<username> -p<password> -h127.0.0.1 -P4404 -e "show querycounter;";
+---------------+
| query_counter |
+---------------+
|      60819702 |
+---------------+
~~~
~~~
[mjknox@database ~]# mysql -u<username> -p<password> -h127.0.0.1 -P4404 -e "show idxremovalcounter;"
+---------------------+
| idx_removal_counter |
+---------------------+
|               66892 |
+---------------------+
~~~

Getting this in place in our environment has saved us many headaches, and our database servers have been much happier because of it. If you are in a similar situation as I was, MySQL Proxy may just be the answer you are looking for.
