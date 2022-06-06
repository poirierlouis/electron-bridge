import {BrowserWindow, ipcMain, IpcMainInvokeEvent, nativeTheme} from 'electron';
import {Bridge} from './bridge';

export class NativeThemeBridge implements Bridge {
    constructor(private win: BrowserWindow) {
    }

    public register(): void {
        nativeTheme.on('updated', this.emitUpdated.bind(this));
        ipcMain.handle('eb.nativeTheme.shouldUseDarkColors', async () => {
            return nativeTheme.shouldUseDarkColors;
        });
        ipcMain.handle('eb.nativeTheme.shouldUseHighContrastColors', async () => {
            return nativeTheme.shouldUseHighContrastColors;
        });
        ipcMain.handle('eb.nativeTheme.shouldUseInvertedColorScheme', async () => {
            return nativeTheme.shouldUseInvertedColorScheme;
        });
        ipcMain.handle('eb.nativeTheme.themeSource', async (_: IpcMainInvokeEvent, value: 'system' | 'light' | 'dark') => {
            nativeTheme.themeSource = value;
        });
    }

    public release(): void {
        nativeTheme.off('updated', this.emitUpdated.bind(this));
        ipcMain.removeHandler('eb.nativeTheme.shouldUseDarkColors');
        ipcMain.removeHandler('eb.nativeTheme.shouldUseHighContrastColors');
        ipcMain.removeHandler('eb.nativeTheme.shouldUseInvertedColorScheme');
        ipcMain.removeHandler('eb.nativeTheme.themeSource');
    }

    private emitUpdated(): void {
        this.win.webContents.send('eb.nativeTheme.updated', {
            shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
            shouldUseHighContrastColors: nativeTheme.shouldUseHighContrastColors,
            shouldUseInvertedColorScheme: nativeTheme.shouldUseInvertedColorScheme,
        });
    }
}
