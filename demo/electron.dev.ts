import {app, BrowserWindow} from 'electron';
import * as path from 'path';
import {BridgeService, DialogBridge, NativeThemeBridge, PowerMonitorBridge, StoreBridge} from "electron-bridge/main";

app.enableSandbox();

function createWindow() {
    const win = new BrowserWindow({
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

    win.loadURL(`http://localhost:3000`).then(() => {
        console.log(`<electron webpack-dev-server::connected />`);
    });

    const bridge = new BridgeService();
    const appPath = app.getPath('userData');

    bridge.add(new DialogBridge())
          .add(new NativeThemeBridge(win))
          .add(new PowerMonitorBridge(win))
          .add(new StoreBridge(appPath))
          .registerAll();

    win.webContents.openDevTools();

    win.on("closed", () => {
        // Release resources
        bridge.releaseAll();
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

