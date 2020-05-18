<template>
  <v-app dark>
    <v-toolbar
      :clipped-left="true"
      fixed
      min-width="100%"
      app
    >
      <v-toolbar-side-icon @click="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-toolbar-items>
        <v-btn fab href="https://github.com/mattk42" small>
          <v-avatar size="25">
            <img src="~/assets/images/Github.png">
          </v-avatar>
        </v-btn>
        <v-btn fab href="https://twitter.com/mknox42" small>
          <v-avatar size="25">
            <img src="~/assets/images/Twitter_logo.svg">
          </v-avatar>
        </v-btn>
        <v-btn fab href="mailto:matt@knox.software" small>
          <v-avatar size="25">
            <img src="~/assets/images/Email_logo.png">
          </v-avatar>
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="false"
      :clipped="true"
      align-end
      fixed
      app
    >
      <v-list>
        <v-list-tile
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          :disabled="item.disabled"
          router
          exact
        >
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title" />
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>



    <v-footer
      :fixed="fixed"
      app
    >
      <span>&copy; 2020</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      drawer: false,
      fixed: false,
      items: [
        {
          icon: "home",
          title: "Home",
          to: "/"
        },
        {
          icon: "build",
          title: "Projects",
          to: "/projects",
          disabled: true
        },
        {
          icon: "code",
          title: "CTF Writeups",
          to: "/ctf"
        },
        {
          icon: "receipt",
          title: "whoami",
          to: "/resume"
        }
      ],
      title: ""
    };
  }
};
</script>
