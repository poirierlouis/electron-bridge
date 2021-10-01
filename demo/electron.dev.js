"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var main_1 = require("electron-bridge/main");
electron_1.app.enableSandbox();
function createWindow() {
    var win = new electron_1.BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nativeWindowOpen: true,
            nodeIntegration: false,
            contextIsolation: true,
            // @ts-ignore
            enableRemoteModule: false,
            preload: path.join(__dirname, 'electron.preload.js')
        }
    });
    win.loadURL("http://localhost:3000").then(function () {
        console.log("<electron webpack-dev-server::connected />");
    });
    var bridge = new main_1.BridgeService();
    var appPath = electron_1.app.getPath('userData');
    bridge.add(new main_1.DialogBridge())
        .add(new main_1.NativeThemeBridge(win))
        .add(new main_1.PowerMonitorBridge(win))
        .add(new main_1.StoreBridge(appPath))
        .registerAll();
    win.webContents.openDevTools();
    win.on("closed", function () {
        // Release resources
        bridge.releaseAll();
    });
}
electron_1.app.whenReady().then(function () {
    createWindow();
    electron_1.app.on('activate', function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
