import path from "path";
import { format as formatUrl } from "url";
import { app, BrowserWindow } from "electron";
import KeyEvents from "./main/events/KeyEvents";
import MouseEvents from "./main/events/MouseEvents";
import ScrollEvents from "./main/events/ScrollEvents";

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow;

require("electron-debug")();

class MainProcess {
  constructor() {
    app.whenReady().then(() => {
      this.createWindows();
      this.registerEvents();

      app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindows();
        }
      });
    });

    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on("window-all-closed", function() {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });
  }

  private createWindows() {
    let url = formatUrl({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true,
    });
    let windowOptions = {
      width: 800,
      height: 600,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
      },
    };

    if (process.env.NODE_ENV !== "production") {
      url = formatUrl({
        pathname: `${process.cwd()}/dist/renderer/index.html`,
        protocol: "file",
        slashes: true,
      });
      new BrowserWindow(windowOptions).loadURL(url);
    }

    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.loadURL(url);

    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow.focus();
      setImmediate(() => {
        mainWindow.focus();
      });
    });
  }

  private registerEvents() {
    new KeyEvents().register();
    new MouseEvents().register();
    new ScrollEvents().register();
  }
}

new MainProcess();
