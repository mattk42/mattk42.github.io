<template>
  <v-container>
    <v-layout align-baseline justify-center row fill-height>
      <v-card>
        <div class="text-xs-center">
          <v-avatar size="300px">
            <img
              src="/images/headshot.png"
            ></img>
          </v-avatar>
        </div>

        <v-card-title primary-title>
          <div>
            <div class="headline" v-text="name" />
            <div v-text="description" />
            <div v-text="location" />
          </div>
        </v-card-title>
      </v-card>
    </v-layout>

    <div class="headline">
      Education
    </div>
    </v-card-title>
    <v-divider />
    <br>
    <v-layout align-baseline justify-center row fill-height>
      <v-flex v-for="(item,i) in education" :key="`comm${i}`" xs6>
        <v-card>
          <div :style="`background-color: ${item.fillcolor}`">
            <v-img height="100px" contain :src="`${item.image}`" />
          </div>
          <v-card-title primary-title>
            <div>
              <h3 class="headline mb-0" v-text="item.school" />
              <v-subheader v-text="item.degree" />
              <div v-text="item.other" />
            </div>
          </v-card-title>
        </v-card>
      </v-flex>
    </v-layout>

    <div class="headline">
      Skills
    </div>
    <v-divider />
    <v-container fluid grid-list-sm>
      <v-layout column wrap>
        <v-expansion-panel
          v-model="panelone"
          expand
        >
          <v-expansion-panel-content
            v-for="(category, c, index) in skills"
            :key="c"
            xs12
            md4
          >
            <div v-if="!panelone[index]" slot="header" v-text="c + ': ' + category.join(', ')" />
            <div v-else slot="header" v-text="c" />
            <v-layout style="background-color:#FFFFFF">
              <v-flex v-for="(skill, i) in category" :key="i" xs4 ma-2>
                <v-img contain height="100px" :src="`/images/logos/${skill}.png`" :alt="`${skill}`" />
              </v-flex>
            </v-layout>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-layout>
    </v-container>

    <div class="headline">
      Experience
    </div>
    <v-divider />
    <v-layout fill-height column>
      <v-timeline dense>
        <v-timeline-item
          v-for="(item, i) in experience"
          :key="i"
          large
          color="#424242"
        >
          <v-avatar slot="icon">
            <img :src="item.logo">
          </v-avatar>
          <v-hover>
            <v-card
              slot-scope="{ hover }"
              :class="`elevation-${hover ? 12 : 3}`"
            >
              <v-card-title :class="`${item.color} justify-end`">
                <v-flex>
                  <h3 class="display-1 mr-3 white--text font-weight-bold" v-text="item.company" />
                  <div v-text="item.timeframe" />
                </v-flex>
              </v-card-title>
              <v-subheader v-text="item.title" />
              <v-card-text>
                <ul v-for="(desc, d) in item.responsibilities" :key="d">
                  <li v-text="desc" />
                </ul>
              </v-card-text>
            </v-card>
          </v-hover>
        </v-timeline-item>
      </v-timeline>
    </v-layout>

    <div class="headline">
      Community
    </div>
    </v-card-title>
    <v-divider />
    <br>
    <v-layout align-baseline justify-center row fill-height>
      <v-flex v-for="(item,i) in community" :key="`comm${i}`" xs6>
        <v-card>
          <v-img aspect-ratio="2.75" :src="`${item.image}`" />

          <v-card-title primary-title>
            <div>
              <h3 class="headline mb-0" v-text="item.title" />
              <v-subheader v-text="item.position" />
              <ul v-for="(point, d) in item.points" :key="d">
                <li v-text="point" />
              </ul>
            </div>
          </v-card-title>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    name: "Matthew Knox",
    email: "mjknox@mjknox.com",
    description: "Developer, System Administrator, and DevOps Enthusiast",
    location: "Boulder, CO",
    education: [
      {
        school: "Northern Michigan University",
        degree: "Bachelor of Science, Computer Science",
        minor: "Mathematics",
        timeframe: "May 2011",
        location: "Marquette, MI",
        other: "Graduated Cum Laude",
        image: "/images/nmubanner.png",
        fillcolor: "#034030"
      }
    ],
    skills: {
      "Programming Languages": [
        "Bash",
        "Python",
        "Java",
        "Ruby",
        "NodeJS",
        "PHP"
      ],
      Databases: ["MySQL", "Amazon Aurora", "Elasticsearch"],
      Monitoring: ["Icinga", "Zabbix", "Sensu"],
      Metrics: ["Datadog", "Collectd", "InfluxDB"],
      Containers: ["Docker", "Kubernetes", "Deis", "Helm"],
      Cloud: ["AWS", "Google Cloud"],
      Misc: ["Git", "Jenkins", "CloudFormation", "Terraform", "Travis"]
    },
    panelone: [false, false, false, false, false, false, false],
    experience: [
      {
        company: "Sphero",
        color: "blue lighten-1",
        timeframe: "Jan 2016 - Present",
        title: "Senior DevOps Developer/Technical Security Lead",
        responsibilities: [
          "Migrated all existing applications from Heroku to our own Kubernetes cluster(s) running in Google Cloud.",
          "Implemented consistent monitoring and metrics across diverse services.",
          "Responsible for performing internal security audits as well as working with third party penetration tests."
        ],
        logo: "images/sphero.png"
      },
      {
        company: "Trackvia",
        timeframe: "Jul 2013 - Jan 2016",
        color: "green",
        title: "System Administrator",
        responsibilities: [
          "Architected cloud based infrastructure for a java based SAAS product.",
          "Automated environment creation and release deployment.",
          "Supported legacy perl/php application running under apache.",
          "Responsible for tuning and maintaining both master/slave MySQL instances and Percona XtraDB Cluster."
        ],
        logo: "images/xvia.jpeg"
      },
      {
        company: "Avaya",
        timeframe: "May 2011 - Jul 2013",
        color: "red",
        title: "Software Engineer II ",
        responsibilities: [
          "Planned and maintained a VMware based lab for capacity testing, running 175 virtual machines across 5 VMware servers.",
          "Known for my flexibility and ability to work in all areas of our code base.",
          "Develop management software for a RedHat based project. Mainly focused on the installer, RPMs, and platform management scripts.",
          "Lead developer for efforts to move our product into the cloud."
        ],
        logo: "images/avaya.png"
      },
      {
        company: "Northern Michigan University - Telecom",
        timeframe: "Aug 2009 - May 2011",
        color: "green lighten-1",
        title: "Network Technician",
        responsibilities: [
          "Maintained phone and data networks on campus.",
          "Used nagios as well as custom scripts for monitoring network health.",
          "Worked with analog and digital phone systems along with Wi-Fi, WiMAX, and wired data networks."
        ],
        logo: "/images/nmu.png"
      },
      {
        company: "Radio X",
        timeframe: "Jan 2008 - May 2011",
        color: "black",
        title: "IT Director",
        responsibilities: [
          "Lead the conversion from a Windows based architecture to Linux.",
          "Built internal cataloging system, local music database, and blog system.",
          "Maintained a Linux based server dedicated to our web based catalog system and online audio stream."
        ],
        logo: "/images/wupx.png"
      },
      {
        company: "Intel",
        timeframe: "May 2009 - Aug 2009",
        color: "blue",
        title: "Software Development Intern",
        responsibilities: [
          "Developed software for viewing hardware test results and scheduling new tests.",
          "Administered MSSQL database for storing hardware test results.",
          "Computer Technician"
        ],
        logo: "/images/intel.png"
      },
      {
        company: "Northern Michigan University - Housing ",
        timeframe: "Nov 2008 - May 2009",
        color: "green lighten-1",
        title: "Developer/Computer Technician",
        responsibilities: [
          "Customized an online housing application using PHP, Smarty, and Oracle.",
          "Maintained computer equipment within the office, including employee workstations and four windows based servers."
        ],
        logo: "/images/nmu.png"
      }
    ],
    community: [
      {
        title: "DevOpsDays Denver",
        position: "Organizer",
        timeframe: "July 2014 - Current",
        points: [
          "Work with fellow community members planning the annual DevOpsDays event in Denver.",
          "Promote the event to the community through meetups and social events."
        ],
        image: "/images/dod.png"
      },
      {
        title: "2018 SnowFroc Conference",
        position: "Speaker",
        timeframe: "March 2018",
        points: [
          "Collaborated with the Senior Director of Application Security at Applied Trust on a talk about Security and DevOps in IoT.",
          "Presented the same talk to the Colorado Electronic Crimes Task Force of the United States Secret Service."
        ],
        image: "/images/snowfroc.png"
      },
      {
        title: "DevOps Denver Meetup",
        position: "CoFounder",
        timeframe: "August 2013 - Jan 2016",
        points: [
          "Co-Founded the meetup to help create a more inclusive DevOps community in the Denver area.",
          "Worked with local community members to find hosting, funding, and informative speakers.",
          "Presented talks on various aspects of AWS as well as personal projects and interesting technologies"
        ],
        image:
          "https://secure.meetupstatic.com/s/img/7223371979728590/app_download/social/fb/meetup.en.png"
      }
    ]
  })
};
</script>
