import {ipcRenderer} from 'electron';
import {BridgeModule} from './bridge.module';

export const PowerSaveBlockerModule: BridgeModule = {
    name: 'powerSaveBlocker',
    readonly: true,
    api: {
        start: async (type: 'prevent-app-suspension' | 'prevent-display-sleep') => {
            return await ipcRenderer.invoke('eb.powerSaveBlocker.start', type);
        },
        stop: async (id: number) => {
            return await ipcRenderer.invoke('eb.powerSaveBlocker.stop', id);
        },
        isStarted: async (id: number) => {
            return await ipcRenderer.invoke('eb.powerSaveBlocker.isStarted', id);
        }
    }
};
