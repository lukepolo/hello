import Plugin from "varie-bundler/lib/plugins/Plugin";
import path from "path";

export default class VarieElectronRendererPlugin extends Plugin<undefined> {
  public register(): void {
    this.bundler.config.bundleName = "renderer";
    this.bundler.config.outputPath = path.join(__dirname, "dist/renderer");

    this.bundler.webpackChain.devServer.open(false);
    this.bundler.webpackChain.target("electron-renderer");
    this.bundler.webpackChain.output.publicPath("");
    this.bundler.webpackChain.output.globalObject(
      "(typeof self !== 'undefined' ? self : this)",
    );
  }
}
