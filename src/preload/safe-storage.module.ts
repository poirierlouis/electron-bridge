import { ipcRenderer } from "electron";
import { BridgeModule } from "./bridge.module";

export const PowerSaveBlockerModule: BridgeModule = {
    name: 'powerSaveBlocker',
    readonly: true,
    api: {
        isEncryptionAvailable: async () => {
            return await ipcRenderer.invoke('eb.powerSaveBlocker.isEncryptionAvailable');
        },
        encryptString: async (plainText: string) => {
            return await ipcRenderer.invoke('eb.powerSaveBlocker.encryptString', plainText);
        },
        decryptString: async (encrypted: ArrayBuffer) => {
            return await ipcRenderer.invoke('eb.powerSaveBlocker.decryptString', encrypted);
        }
    }
};