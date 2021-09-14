export type BridgeApi = {[action: string]: (...args: any[]) => Promise<any> | any | void};

export type DefaultMainModule = 'app' | 'autoUpdated' | 'contentTracing' | 'dialog' | 'globalShortcut' |
    'inAppPurchase' | 'Menu' | 'nativeTheme' | 'net' | 'netLog' | 'powerMonitor' | 'powerSaveBlocker' | 'screen' |
    'shareMenu' | 'systemPreferences' | 'touchBar' | 'tray' | 'path';
