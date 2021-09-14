import {BrowserWindow, ipcMain, nativeTheme} from 'electron';
import {Bridge} from "./bridge";
import {ThemeUpdatedEvent} from "../renderer/native-theme.api";

export class NativeThemeBridge implements Bridge {

    constructor(private win: BrowserWindow) {

    }

    public register(): void {
        nativeTheme.on('updated', this.onUpdated.bind(this));
        ipcMain.handle('eb.nativeTheme.themeSource', (event, result) => {
            nativeTheme.themeSource = result;
        });
    }

    public release(): void {
        ipcMain.removeHandler('eb.nativeTheme.themeSource');
        nativeTheme.off('updated', this.onUpdated.bind(this));
    }

    private onUpdated(): void {
        this.win.webContents.send('eb.nativeTheme.updated', <ThemeUpdatedEvent>{
            shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
            shouldUseHighContrastColors: nativeTheme.shouldUseHighContrastColors,
            shouldUseInvertedColorScheme: nativeTheme.shouldUseInvertedColorScheme,
        });
    }

}
