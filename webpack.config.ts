import path from "path";
import dotnev from "dotenv";
import { WebBundler } from "varie-bundler";
import VarieElectronRendererPlugin from "./varie-bundler-plugins/VarieElectronRendererPlugin";
import VarieElectronMainProcessPlugin from "./varie-bundler-plugins/VarieElectronMainProcessPlugin";

const env = dotnev.config().parsed;

export default function({ mode, platform }) {
  let bundles = [];
  if (platform === "app") {
    let main = new WebBundler(mode, {
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

    bundles.push(...main.build());
  }

  let app = new WebBundler(mode, {
    bundleName: "app",
    vue: {
      runtimeOnly: false,
    },
    outputPath:
      platform === "web"
        ? path.join(__dirname, "public")
        : path.join(__dirname, "dist/renderer"),
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
        host: env.SIGNAL_SERVER_HOST,
      },
      "rtc-settings": {
        iceServers: env.ICE_SERVERS,
      },
      app: {
        host: env.API_HOST,
        platform,
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

      config.node.set("fs", "empty");
    })
    .globalSassIncludes("resources/sass/global_variables.scss");

  if (platform === "app") {
    app.plugin(VarieElectronRendererPlugin);
  }

  bundles.push(...app.build());

  return bundles;
}
