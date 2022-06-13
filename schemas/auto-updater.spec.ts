import {autoUpdater, BrowserWindow} from 'electron';
import {AutoUpdater} from './auto-updater';

jest.mock('electron', () => ({
    BrowserWindow: jest.fn().mockImplementation(),
    autoUpdater: {
        on: jest.fn(),
        off: jest.fn(),
        setFeedURL: jest.fn(),
        getFeedURL: jest.fn(),
        checkForUpdates: jest.fn(),
        quitAndInstall: jest.fn()
    }
}));

describe(AutoUpdater, () => {
    let schema: AutoUpdater;
    let win: BrowserWindow;

    beforeAll(() => {
        win = new BrowserWindow();
    });

    beforeEach(() => {
        schema = new AutoUpdater(win);
    });

    afterEach(() => {
        // @ts-ignore
        autoUpdater.on.mockClear();
        // @ts-ignore
        autoUpdater.off.mockClear();
    });

    describe('Lifecycle', () => {
        it('GIVEN bridge WHEN calling register() THEN listens on autoUpdater events', () => {
            schema.register();

            expect(autoUpdater.on).toHaveBeenCalledWith('error', expect.any(Function));
            expect(autoUpdater.on).toHaveBeenCalledWith('checking-for-update', expect.any(Function));
            expect(autoUpdater.on).toHaveBeenCalledWith('update-available', expect.any(Function));
            expect(autoUpdater.on).toHaveBeenCalledWith('update-not-available', expect.any(Function));
            expect(autoUpdater.on).toHaveBeenCalledWith('update-downloaded', expect.any(Function));
            expect(autoUpdater.on).toHaveBeenCalledWith('before-quit-for-update', expect.any(Function));
        });

        it('GIVEN bridge WHEN calling release() THEN removes listeners on autoUpdater events', () => {
            schema.release();

            expect(autoUpdater.off).toHaveBeenCalledWith('error', expect.any(Function));
            expect(autoUpdater.off).toHaveBeenCalledWith('checking-for-update', expect.any(Function));
            expect(autoUpdater.off).toHaveBeenCalledWith('update-available', expect.any(Function));
            expect(autoUpdater.off).toHaveBeenCalledWith('update-not-available', expect.any(Function));
            expect(autoUpdater.off).toHaveBeenCalledWith('update-downloaded', expect.any(Function));
            expect(autoUpdater.off).toHaveBeenCalledWith('before-quit-for-update', expect.any(Function));
        });
    });

    describe('Bridge calls', () => {
        it('should call autoUpdater.setFeedURL with options', () => {
            // @ts-ignore
            autoUpdater.setFeedURL.mockReturnValue({url: 'https://somewhere.com'});

            schema.setFeedURL({url: 'https://somewhere.com'});

            expect(autoUpdater.setFeedURL).toHaveBeenCalledWith({url: 'https://somewhere.com'});
        });

        it('should call autoUpdater.getFeedURL and return options', async () => {
            // @ts-ignore
            autoUpdater.getFeedURL.mockReturnValue('https://somewhere.com');

            const url: string = await schema.getFeedURL();

            expect(url).toEqual('https://somewhere.com');
            expect(autoUpdater.getFeedURL).toHaveBeenCalled();
        });

        it('should call autoUpdater.checkForUpdates', () => {
            schema.checkForUpdates();

            expect(autoUpdater.checkForUpdates).toHaveBeenCalled();
        });

        it('should call autoUpdater.quitAndInstall', () => {
            schema.quitAndInstall();

            expect(autoUpdater.quitAndInstall).toHaveBeenCalled();
        });
    });

    describe('Events', () => {
        it('should declare listeners', () => {
            expect(schema.onError).toBeDefined();
            expect(schema.onCheckingForUpdate).toBeDefined();
            expect(schema.onUpdateAvailable).toBeDefined();
            expect(schema.onUpdateNotAvailable).toBeDefined();
            expect(schema.onUpdateDownloaded).toBeDefined();
            expect(schema.onBeforeQuitForUpdate).toBeDefined();
        });
    });
});
