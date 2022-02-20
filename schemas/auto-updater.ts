import {autoUpdater, BrowserWindow, Event, FeedURLOptions} from 'electron';
import {EventListener, Schema} from '@lpfreelance/electron-bridge-cli';

/**
 * Enable apps to automatically update themselves.
 */
@Schema(false)
export class AutoUpdater {

    private static events: string[] = [
        'checking-for-update',
        'update-available',
        'update-not-available',
        'before-quit-for-update'
    ];

    constructor(private win: BrowserWindow) {

    }

    public register(): void {
        AutoUpdater.events.forEach(event => {
            autoUpdater.on(<any>event, () => this.win.webContents.send(`eb.autoUpdater.${event}`));
        });
        autoUpdater.on('error', (error: Error) => {
            this.win.webContents.send(`eb.autoUpdater.error`, error);
        });
        autoUpdater.on('update-downloaded', (event: Event, releaseNotes: string, releaseName: string,
                                             releaseDate: Date, updateURL: string) => {
            this.win.webContents.send(`eb.autoUpdater.update-downloaded`, event, releaseNotes, releaseName,
                releaseDate, updateURL);
        });
    }

    public release(): void {
        AutoUpdater.events.forEach(event => {
            autoUpdater.off(<any>event, () => this.win.webContents.send(`eb.autoUpdater.${event}`));
        });
    }

    public setFeedURL(options: FeedURLOptions): void {
        autoUpdater.setFeedURL(options);
    }

    public async getFeedURL(): Promise<string> {
        return autoUpdater.getFeedURL();
    }

    public checkForUpdates(): void {
        autoUpdater.checkForUpdates();
    }

    public quitAndInstall(): void {
        autoUpdater.quitAndInstall();
    }

    @EventListener('error')
    public onError(listener: (error: Error) => void): void {

    }

    @EventListener('checking-for-update')
    public onCheckingForUpdate(listener: Function): void {

    }

    @EventListener('update-available')
    public onUpdateAvailable(listener: Function): void {

    }

    @EventListener('update-not-available')
    public onUpdateNotAvailable(listener: Function): void {

    }

    @EventListener('update-downloaded')
    public onUpdateDownloaded(listener: (event: Event, releaseNotes: string, releaseName: string, releaseDate: Date,
                                         updateURL: string) => void): void {

    }

    @EventListener('before-quit-for-update')
    public onBeforeQuitForUpdate(listener: Function): void {

    }

}
