<template>
  <v-container fluid>
    <v-row>
      <v-col
        v-for="card in cards"
        :key="card.image"
        cols="3"
        sm="4"
      >
        <v-card
          class="pa-2"
        >
          <v-img
            class="white--text align-end"
            :src="card.image"
          />

          <v-card-text class="text--primary" />

          <v-card-actions
            v-for="writeup in card.writeups"
            :key="writeup.title"
          >
            <v-btn
              color="green"
              :disabled="writeup.disabled"
              v-text="writeup.title"
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
      cards: [
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
          writeups: [
            {
              title: "Blog from the future",
              disabled: true
            },
            {
              title: "Fire/place",
              disabled: true
            },
            {
              title: "Selfhost all the things!",
              disabled: true
            }
          ]
        }
      ]
    };
  }
};
</script>
