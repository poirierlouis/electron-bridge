import {ipcRenderer} from 'electron';
import {BridgeModule} from "./bridge.module";

export const StoreModule: BridgeModule = {
    name: 'store',
    readonly: false,
    api: {
        store: async (name: string) => {
            return await ipcRenderer.invoke('eb.store.store', name);
        },

        set: async (key: string, value: any) => {
            return await ipcRenderer.invoke('eb.store.set', key, value);
        },

        has: async (key: string) => {
            return await ipcRenderer.invoke('eb.store.has', key);
        },

        get: async (key: string) => {
            return await ipcRenderer.invoke('eb.store.get', key);
        },

        delete: async (key: string) => {
            return await ipcRenderer.invoke('eb.store.delete', key);
        }
    }
};
