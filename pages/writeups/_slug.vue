<template>
  <div>
    <h1>{{ attributes.title }}</h1>
    <component :is="selectedArticle" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      attributes: {},
      selectedArticle: null
    };
  },
  created() {
    const markdown = require(`~/content/${this.$route.query.event}/${
      this.$route.query.challenge
    }.md`);
    this.attributes = markdown.attributes;
    this.selectedArticle = markdown.vue.component;
    // Use Async Components for the benefit of code splitting
    // https://vuejs.org/v2/guide/components-dynamic-async.html#Async-Components
    // this.selectedArticle = () => import(`~/articles/${this.$route.query.name}.md`).then(({ vue }) => vue.component)
  }
};
</script>
