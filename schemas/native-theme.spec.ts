import {BrowserWindow, nativeTheme} from 'electron';
import {NativeTheme} from './native-theme';

jest.mock('electron', () => ({
    BrowserWindow: jest.fn().mockImplementation(() => ({
        webContents: {
            send: jest.fn()
        }
    })),
    nativeTheme: {
        on: jest.fn(),
        off: jest.fn(),
        themeSource: jest.fn()
    }
}));

describe(NativeTheme, () => {
    let schema: NativeTheme;
    let win: BrowserWindow;

    beforeAll(() => {
        win = new BrowserWindow();
    });

    beforeEach(() => {
        schema = new NativeTheme(win);
    });

    afterEach(() => {
        // @ts-ignore
        nativeTheme.on.mockClear();
        // @ts-ignore
        nativeTheme.off.mockClear();
    });

    describe('Lifecycle', () => {
        it('GIVEN bridge WHEN calling register() THEN listens on nativeTheme events', () => {
            schema.register();

            expect(nativeTheme.on).toHaveBeenCalledWith('updated', expect.any(Function));
        });

        it('GIVEN bridge WHEN calling release() THEN removes listeners on nativeTheme events', () => {
            schema.release();

            expect(nativeTheme.off).toHaveBeenCalledWith('updated', expect.any(Function));
        });
    });

    describe('Bridge calls', () => {
        it('should call nativeTheme.shouldUseDarkColors and return promise', async () => {
            // @ts-ignore
            nativeTheme.shouldUseDarkColors = true;

            await expect(schema.shouldUseDarkColors()).resolves.toEqual(true);
        });

        it('should call nativeTheme.shouldUseHighContrastColors and return promise', async () => {
            // @ts-ignore
            nativeTheme.shouldUseHighContrastColors = false;

            await expect(schema.shouldUseHighContrastColors()).resolves.toEqual(false);
        });

        it('should call nativeTheme.shouldUseInvertedColorScheme and return promise', async () => {
            // @ts-ignore
            nativeTheme.shouldUseInvertedColorScheme = true;

            await expect(schema.shouldUseInvertedColorScheme()).resolves.toEqual(true);
        });

        it('should set nativeTheme.themeSource and return promise', async () => {
            await schema.themeSource('dark');

            expect(nativeTheme.themeSource).toEqual('dark');
        });
    });

    describe('Events', () => {
        it('should declare listeners', () => {
            expect(schema.onUpdated).toBeDefined();
        });
    });
});
