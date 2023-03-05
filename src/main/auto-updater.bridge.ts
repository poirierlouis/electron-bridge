import {autoUpdater, BrowserWindow, FeedURLOptions, ipcMain, IpcMainInvokeEvent} from "electron";
import {Bridge} from "./bridge";

export class AutoUpdaterBridge implements Bridge {
    private static events: string[] = [
        //'error',
        'checking-for-update',
        'update-available',
        'update-not-available',
        //'update-downloaded',
        'before-quit-for-update'
    ];

    constructor(private win: BrowserWindow) {
    }

    public register(): void {
        AutoUpdaterBridge.events.forEach(event => {
            autoUpdater.on(<any>event, () => {
                this.win.webContents.send(`eb.autoUpdater.${event}`);
            });
        });
        autoUpdater.on('error', (error: Error) => {
            this.win.webContents.send(`eb.autoUpdater.error`, error);
        });
        autoUpdater.on('update-downloaded', (event: Event, releaseNotes: string, releaseName: string,
            releaseDate: Date, updateURL: string) => {
            this.win.webContents.send(`eb.autoUpdater.update-downloaded`, event, releaseNotes, releaseName, releaseDate, updateURL);
        });
        ipcMain.handle('eb.autoUpdater.setFeedURL', (_: IpcMainInvokeEvent, options: FeedURLOptions) => {
            autoUpdater.setFeedURL(options);
        });
        ipcMain.handle('eb.autoUpdater.getFeedURL', async () => {
            return autoUpdater.getFeedURL();
        });
        ipcMain.handle('eb.autoUpdater.checkForUpdates', () => {
            autoUpdater.checkForUpdates();
        });
        ipcMain.handle('eb.autoUpdater.quitAndInstall', () => {
            autoUpdater.quitAndInstall();
        });
    }

    public release(): void {
        AutoUpdaterBridge.events.forEach(event => {
            autoUpdater.off(<any>event, () => {
                this.win.webContents.send(`eb.autoUpdater.${event}`);
            });
        });
        autoUpdater.off('error', (error: Error) => {
            this.win.webContents.send(`eb.autoUpdater.error`, error);
        });
        autoUpdater.off('update-downloaded', (event: Event, releaseNotes: string, releaseName: string,
            releaseDate: Date, updateURL: string) => {
            this.win.webContents.send(`eb.autoUpdater.update-downloaded`, event, releaseNotes, releaseName, releaseDate, updateURL);
        });
        ipcMain.removeHandler('eb.autoUpdater.setFeedURL');
        ipcMain.removeHandler('eb.autoUpdater.getFeedURL');
        ipcMain.removeHandler('eb.autoUpdater.checkForUpdates');
        ipcMain.removeHandler('eb.autoUpdater.quitAndInstall');
    }
}
