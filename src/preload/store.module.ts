import {ipcRenderer} from 'electron';
import {BridgeModule} from './bridge.module';

export const StoreModule: BridgeModule = {
    name: 'store',
    readonly: true,
    api: {
        withStore: async (storePath: string, isEncrypted: boolean) => {
            return await ipcRenderer.invoke('eb.store.withStore', storePath, isEncrypted);
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
