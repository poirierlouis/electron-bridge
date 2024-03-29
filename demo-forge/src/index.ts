import {app, BrowserWindow} from 'electron';
import {BridgeService} from '@lpfreelance/electron-bridge/main';
import {ClipboardBridge} from './bridge/main/clipboard.bridge';
import {FastNoiseBridge} from './bridge/main/fast_noise.bridge';
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const DEMO_FORGE_WEBPACK_ENTRY: string;
declare const DEMO_FORGE_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

app.enableSandbox();

const createWindow = (): void => {
  // Create the browser window.
  const win = new BrowserWindow({
    height: 720,
    width: 1280,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: DEMO_FORGE_PRELOAD_WEBPACK_ENTRY,
    },
  });
  // Create bridge service.
  const bridgeService = new BridgeService();

  // Append bridges that you need and register all IPC handlers.
  bridgeService
      .add(new ClipboardBridge())
      .add(new FastNoiseBridge())
      .registerAll();

  win.on('closed', () => {
    // Release bridges resources.
    bridgeService.releaseAll();
  });

  // and load the index.html of the app.
  win.loadURL(DEMO_FORGE_WEBPACK_ENTRY);

  // Open the DevTools.
  win.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
