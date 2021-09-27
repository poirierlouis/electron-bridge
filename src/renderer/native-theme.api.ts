
/**
 * Emitted when something in the underlying NativeTheme has changed.
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
    shouldUseDarkColors(): Promise<boolean>;
    shouldUseHighContrastColors(): Promise<boolean>;
    shouldUseInvertedColorScheme(): Promise<boolean>;
    themeSource(value: 'system' | 'light' | 'dark'): Promise<void>;
    onUpdated(listener: (event: ThemeUpdatedEvent) => void): void;
}
