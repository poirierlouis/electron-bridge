import {FeedURLOptions} from 'electron';

/**
 * Enable apps to automatically update themselves.
 */
export interface AutoUpdaterApi {
    setFeedURL(options: FeedURLOptions): void;

    getFeedURL(): Promise<string>;

    checkForUpdates(): void;

    quitAndInstall(): void;

    onError(listener: (error: Error) => void): void;

    onCheckingForUpdate(listener: Function): void;

    onUpdateAvailable(listener: Function): void;

    onUpdateNotAvailable(listener: Function): void;

    onUpdateDownloaded(listener: (event: Event, releaseNotes: string, releaseName: string, releaseDate: Date,
        updateURL: string) => void): void;

    onBeforeQuitForUpdate(listener: Function): void;
}
