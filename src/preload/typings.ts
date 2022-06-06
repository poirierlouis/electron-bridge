export type BridgeApi = { [action: string]: (...args: any[]) => Promise<any> | any | void };

export type DefaultMainModule =
    'autoUpdater'
    | 'dialog'
    | 'fileSystem'
    | 'nativeTheme'
    | 'path'
    | 'powerMonitor'
    | 'store';
