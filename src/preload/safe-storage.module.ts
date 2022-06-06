import {ipcRenderer} from 'electron';
import {BridgeModule} from './bridge.module';

export const SafeStorageModule: BridgeModule = {
    name: 'safeStorage',
    readonly: true,
    api: {
        isEncryptionAvailable: async () => {
            return await ipcRenderer.invoke('eb.safeStorage.isEncryptionAvailable');
        },
        encryptString: async (plainText: string) => {
            return await ipcRenderer.invoke('eb.safeStorage.encryptString', plainText);
        },
        decryptString: async (encrypted: ArrayBuffer) => {
            return await ipcRenderer.invoke('eb.safeStorage.decryptString', encrypted);
        }
    }
};
