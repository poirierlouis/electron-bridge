import {FeedURLOptions, ipcRenderer, IpcRendererEvent} from 'electron';
import {BridgeModule} from './bridge.module';

export const AutoUpdaterModule: BridgeModule = {
    name: 'autoUpdater',
    readonly: false,
    api: {
        setFeedURL: (options: FeedURLOptions) => {
            ipcRenderer.invoke('eb.autoUpdater.setFeedURL', options);
        },
        getFeedURL: async () => {
            return await ipcRenderer.invoke('eb.autoUpdater.getFeedURL');
        },
        checkForUpdates: () => {
            ipcRenderer.invoke('eb.autoUpdater.checkForUpdates');
        },
        quitAndInstall: () => {
            ipcRenderer.invoke('eb.autoUpdater.quitAndInstall');
        },
        onError: (listener: (error: Error) => void) => {
            ipcRenderer.on('eb.autoUpdater.error', (_: IpcRendererEvent, error: Error) => {
                listener(error);
            });
        },
        onCheckingForUpdate: (listener: Function) => {
            ipcRenderer.on('eb.autoUpdater.checking-for-update', () => {
                listener();
            });
        },
        onUpdateAvailable: (listener: Function) => {
            ipcRenderer.on('eb.autoUpdater.update-available', () => {
                listener();
            });
        },
        onUpdateNotAvailable: (listener: Function) => {
            ipcRenderer.on('eb.autoUpdater.update-not-available', () => {
                listener();
            });
        },
        onUpdateDownloaded: (listener: (event: Event, releaseNotes: string, releaseName: string, releaseDate: Date,
            updateURL: string) => void) => {
            ipcRenderer.on('eb.autoUpdater.update-downloaded', (_: IpcRendererEvent, event: Event, releaseNotes: string, releaseName: string, releaseDate: Date,
                updateURL: string) => {
                listener(event, releaseNotes, releaseName, releaseDate, updateURL);
            });
        },
        onBeforeQuitForUpdate: (listener: Function) => {
            ipcRenderer.on('eb.autoUpdater.before-quit-for-update', () => {
                listener();
            });
        }
    }
};
