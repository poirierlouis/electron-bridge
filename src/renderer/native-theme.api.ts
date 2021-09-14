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
export interface NativeThemeApi {

    updated(callback: (event: ThemeUpdatedEvent) => void): void;
    themeSource(value: 'system' | 'light' | 'dark'): Promise<void>;

}
