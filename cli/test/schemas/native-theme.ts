import {BrowserWindow, nativeTheme} from "electron";
import {EventListener, Schema} from "electron-bridge-cli";

/**
 *
 */
export interface ThemeUpdatedEvent {
    shouldUseDarkColors: boolean;
    shouldUseHighContrastColors: boolean;
    shouldUseInvertedColorScheme: boolean;
}

/**
 * Read and respond to changes in Chromium's native color theme.
 */
@Schema(false)
export class NativeTheme {

    constructor(private win: BrowserWindow) {

    }

    public register(): void {
        nativeTheme.on('updated', this.emitUpdated.bind(this));
    }

    public release(): void {
        nativeTheme.off('updated', this.emitUpdated.bind(this));
    }

    public async shouldUseDarkColors(): Promise<boolean> {
        return nativeTheme.shouldUseDarkColors;
    }

    public async shouldUseHighContrastColors(): Promise<boolean> {
        return nativeTheme.shouldUseHighContrastColors;
    }

    public async shouldUseInvertedColorScheme(): Promise<boolean> {
        return nativeTheme.shouldUseInvertedColorScheme;
    }

    public async themeSource(value: 'system' | 'light' | 'dark'): Promise<void> {
        nativeTheme.themeSource = value;
    }

    @EventListener('updated')
    public onUpdated(listener: (event: ThemeUpdatedEvent) => void): void {

    }

    private emitUpdated(): void {
        this.win.webContents.send('eb.nativeTheme.updated', {
            shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
            shouldUseHighContrastColors: nativeTheme.shouldUseHighContrastColors,
            shouldUseInvertedColorScheme: nativeTheme.shouldUseInvertedColorScheme,
        });
    }

}
