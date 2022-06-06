import {ipcRenderer, IpcRendererEvent} from 'electron';
import {ThemeUpdatedEvent} from '../renderer/native-theme.api';
import {BridgeModule} from './bridge.module';

export const NativeThemeModule: BridgeModule = {
    name: 'nativeTheme',
    readonly: false,
    api: {
        shouldUseDarkColors: async () => {
            return await ipcRenderer.invoke('eb.nativeTheme.shouldUseDarkColors');
        },
        shouldUseHighContrastColors: async () => {
            return await ipcRenderer.invoke('eb.nativeTheme.shouldUseHighContrastColors');
        },
        shouldUseInvertedColorScheme: async () => {
            return await ipcRenderer.invoke('eb.nativeTheme.shouldUseInvertedColorScheme');
        },
        themeSource: async (value: 'system' | 'light' | 'dark') => {
            return await ipcRenderer.invoke('eb.nativeTheme.themeSource', value);
        },
        onUpdated: (listener: (event: ThemeUpdatedEvent) => void) => {
            ipcRenderer.on('eb.nativeTheme.updated', (_: IpcRendererEvent, event: ThemeUpdatedEvent) => {
                listener(event);
            });
        }
    }
};
