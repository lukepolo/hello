import path from "path";
import dotnev from "dotenv";
import { WebBundler } from "varie-bundler";
import VarieElectronRendererPlugin from "./varie-bundler-plugins/VarieElectronRendererPlugin";
import VarieElectronMainProcessPlugin from "./varie-bundler-plugins/VarieElectronMainProcessPlugin";

const config = dotnev.config().parsed;

export default function(env) {
  let main = new WebBundler(env, {
    bundleName: "main process",
    webpack: {
      devServer: {
        open: false,
      },
    },
    outputPath: path.join(__dirname, "dist/main"),
  })
    .entry("main", ["main"])
    .aliases({
      "@app": "app",
      "@views": "views",
      "@store": "store",
      "@config": "config",
      "@routes": "routes",
      "@models": "app/models",
      "@resources": "resources",
      "@components": "app/components",
    })
    // ROBOT.JS
    .chainWebpack((config) => {
      config.module
        .rule("node-loader")
        .test(/\.node$/)
        .use("node-loader")
        .loader("native-addon-loader");
    })
    .plugin(VarieElectronMainProcessPlugin);

  let app = new WebBundler(env, {
    bundleName: "app",
    vue: {
      runtimeOnly: false,
    },
    outputPath: path.join(__dirname, "dist/renderer"),
  })
    .entry("renderer", ["app/app.ts", "resources/sass/app.scss"])
    .aliases({
      "@app": "app",
      "@views": "views",
      "@store": "store",
      "@config": "config",
      "@routes": "routes",
      "@models": "app/models",
      "@resources": "resources",
      "@components": "app/components",
    })
    .varieConfig({
      // @ts-ignore -- fix varie bundler
      "signal-server": {
        host: config.SIGNAL_SERVER_HOST,
      },
    })
    .purgeCss(["app", "views", "node_modules/varie"])
    .globalSassIncludes("resources/sass/base/_variables.scss")
    .aggressiveVendorSplitting()
    .eslint()
    .chainWebpack((config) => {
      config.module
        .rule("images")
        .use("file-loader")
        .loader("file-loader")
        .tap((options) => {
          options.esModule = false;
          return options;
        });
    })
    .globalSassIncludes("resources/sass/global_variables.scss")
    .plugin(VarieElectronRendererPlugin);

  return [...main.build(), , ...app.build()];
}
