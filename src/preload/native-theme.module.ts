import {ipcRenderer} from 'electron';
import {BridgeModule} from "./bridge.module";
import {ThemeUpdatedEvent} from "../renderer/native-theme.api";

export const NativeThemeModule: BridgeModule = {
    name: 'nativeTheme',
    readonly: false,
    api: {
        updated: (callback: (event: ThemeUpdatedEvent) => void) => {
            ipcRenderer.on('eb.nativeTheme.updated', (event, data) => {
                callback(data);
            });
        },

        themeSource: async (value: 'system' | 'light' | 'dark') => {
            return await ipcRenderer.invoke('eb.nativeTheme.themeSource', value);
        }
    }
};
