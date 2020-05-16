<template>
  <v-layout>
    <v-flex text-xs-center>
      <blockquote class="blockquote">
        &#8220;<span v-text="selectedQuote.quote" />&#8221;
        <footer>
          <small>
            <em>&mdash;<span v-text="selectedQuote.author" /></em>
          </small>
        </footer>
      </blockquote>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      quotes: [
        {
          quote:
            "If you want to double your success rate, triple your failure rate.",
          author: "Cory Doctorow, Pirate Cinema"
        },
        {
          quote: "First, solve the problem. Then, write the code.",
          author: "John Johnson"
        },
        {
          quote:
            "In the beginning the Universe was created. This has made a lot of people very angry and been widely regarded as a bad move.",
          author: "Douglas Adams, The Hitchhiker's Guide to the Galaxy"
        },
        {
          quote:
            "Arguing that you don't care about the right to privacy because you have nothing to hide is no different than saying you don't care about free speech because you have nothing to say.",
          author: "Edward Snowden, Permanent Record"
        }
      ],
      selectedQuote: {}
    };
  },
  created() {
    const idx = Math.floor(Math.random() * this.quotes.length);
    this.selectedQuote = this.quotes[idx];
  }
};
</script>
