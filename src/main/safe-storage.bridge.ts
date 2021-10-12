import { ipcMain, IpcMainInvokeEvent, safeStorage } from "electron";
import { Bridge } from "./bridge";

export class PowerSaveBlockerBridge implements Bridge {
    public register(): void {
        ipcMain.handle('eb.powerSaveBlocker.isEncryptionAvailable', async () => {
            return safeStorage.isEncryptionAvailable();
        });
        ipcMain.handle('eb.powerSaveBlocker.encryptString', async (_: IpcMainInvokeEvent, plainText: string) => {
            return safeStorage.encryptString(plainText);
        });
        ipcMain.handle('eb.powerSaveBlocker.decryptString', async (_: IpcMainInvokeEvent, encrypted: ArrayBuffer) => {
            return safeStorage.decryptString(new Buffer(encrypted));
        });
    }

    public release(): void {
        ipcMain.removeHandler('eb.powerSaveBlocker.isEncryptionAvailable');
        ipcMain.removeHandler('eb.powerSaveBlocker.encryptString');
        ipcMain.removeHandler('eb.powerSaveBlocker.decryptString');
    }
}
