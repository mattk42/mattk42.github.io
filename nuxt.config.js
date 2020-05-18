import path from "path";
import FMMode from "frontmatter-markdown-loader/mode";
const fs = require("fs");
const VuetifyLoaderPlugin = require("vuetify-loader/lib/plugin");
const pkg = require("./package");

function walkDir(dir) {
  let dirs = [dir];
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      dirs = dirs.concat(walkDir(dirPath));
    }
  });
  return dirs;
}

module.exports = {
  mode: "universal",

  /*
  ** Headers of the page
  */
  head: {
    title: pkg.name,
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: pkg.description }
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      {
        rel: "stylesheet",
        href:
          "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons"
      }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: "#fff" },

  /*
  ** Global CSS
  */
  css: ["~/assets/style/app.styl"],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: ["@/plugins/vuetify"],

  /*
  ** Build configuration
  */
  build: {
    transpile: ["vuetify/lib"],
    plugins: [new VuetifyLoaderPlugin()],
    loaders: {
      stylus: {
        import: ["~assets/style/variables.styl"]
      }
    },

    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: "pre",
          test: /\.(js|vue)$/,
          loader: "eslint-loader",
          exclude: /(node_modules)/
        });
      }
      config.module.rules.push({
        test: /\.md$/,
        loader: "frontmatter-markdown-loader",
        include: walkDir(path.resolve(__dirname, "content")),
        options: {
          mode: [FMMode.VUE_COMPONENT],
          vue: {
            root: "markdown-body"
          }
        }
      });
    }
  }
};
