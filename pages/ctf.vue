<template>
  <v-container fluid>
    <v-row>
      <v-col
        v-for="event in events"
        :key="event.image"
        cols="3"
        sm="4"
      >
        <v-card
          class="pa-2"
        >
          <v-img
            class="white--text align-end"
            :src="event.image"
          />

          <v-card-text class="text--primary" />

          <v-card-actions
            v-for="writeup in event.writeups"
            :key="writeup.title"
          >
            <v-btn
              color="green"
              :disabled="writeup.disabled"
              v-text="writeup.title"
              link=true
              :href="`${writeup.url ? writeup.url : writeup.title}`"
            />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      events: [
        {
          image: "images/hackthebox.png",
          url: "https://www.hackthebox.eu",
          writeups: [
            {
              title: "Traceback",
              disabled: true
            },
            {
              title: "OpenAdmin",
              disabled: true
            },
            {
              title: "Traverxec",
              disabled: true
            }
          ]
        },
        {
          image: "images/houseplant.jpeg",
          url: "https://houseplant.riceteacatpanda.wtf/home",
          id: "houseplant-2020",
          writeups: [
            {
              title: "Blog from the future",
              url:
                "https://github.com/TheLeagueOfSociallyDistancedGentlemen/HouseplantCTF2020/blob/master/Web.md#blog-from-the-future",
              type: "Web"
            },
            {
              title: "Fire/place",
              url:
                "https://github.com/TheLeagueOfSociallyDistancedGentlemen/HouseplantCTF2020/blob/master/Web.md#fireplace",
              type: "Web"
            },
            {
              title: "Selfhost all the things!",
              url:
                "https://github.com/TheLeagueOfSociallyDistancedGentlemen/HouseplantCTF2020/blob/master/Web.md#selfhost-all-the-things",
              type: "Web"
            },
            {
              title: "QR Generator",
              url:
                "https://github.com/TheLeagueOfSociallyDistancedGentlemen/HouseplantCTF2020/blob/master/Web.md#qr-generator",
              type: "Web"
            },
            {
              title: "Jess's Guitar",
              url:
                "https://github.com/TheLeagueOfSociallyDistancedGentlemen/HouseplantCTF2020/blob/master/Forensics.md#jesss-guitar",
              type: "Forensics"
            },
            {
              title: "Imagery",
              url:
                "https://github.com/TheLeagueOfSociallyDistancedGentlemen/HouseplantCTF2020/blob/master/Forensics.md#imagery",
              type: "Forensics"
            }
          ]
        }
      ]
    };
  }
};
</script>
