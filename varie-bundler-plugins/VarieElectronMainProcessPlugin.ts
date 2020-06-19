import Plugin from "varie-bundler/lib/plugins/Plugin";
import path from "path";

export default class VarieElectronMainProcessPlugin extends Plugin<undefined> {
  public register(): void {
    this.bundler.config.bundleName = "main process";
    this.bundler.config.outputPath = path.join(__dirname, "dist/main");

    this.bundler.webpackChain.devServer.open(false);
    this.bundler.webpackChain.target("electron-main");
    this.bundler.webpackChain.output.publicPath("");
    this.bundler.webpackChain.output.globalObject(
      "(typeof self !== 'undefined' ? self : this)",
    );

    this.bundler.webpackChain.plugins.delete("html");
    this.bundler.webpackChain.optimization.splitChunks({});
    this.bundler.webpackChain.optimization.runtimeChunk(false);
    this.bundler.webpackChain.output.filename("[name].js");
    this.bundler.webpackChain.devServer.writeToDisk(true);
    this.bundler.webpackChain.node.set("__filename", false);
    this.bundler.webpackChain.node.set("__dirname", false);
  }
}
