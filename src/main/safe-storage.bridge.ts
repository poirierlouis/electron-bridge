import { ipcMain, IpcMainInvokeEvent, safeStorage } from "electron";
import { Bridge } from "./bridge";

export class SafeStorageBridge implements Bridge {
    public register(): void {
        ipcMain.handle('eb.safeStorage.isEncryptionAvailable', async () => {
            return safeStorage.isEncryptionAvailable();
        });
        ipcMain.handle('eb.safeStorage.encryptString', async (_: IpcMainInvokeEvent, plainText: string) => {
            return safeStorage.encryptString(plainText);
        });
        ipcMain.handle('eb.safeStorage.decryptString', async (_: IpcMainInvokeEvent, encrypted: ArrayBuffer) => {
            return safeStorage.decryptString(new Buffer(encrypted));
        });
    }

    public release(): void {
        ipcMain.removeHandler('eb.safeStorage.isEncryptionAvailable');
        ipcMain.removeHandler('eb.safeStorage.encryptString');
        ipcMain.removeHandler('eb.safeStorage.decryptString');
    }
}
