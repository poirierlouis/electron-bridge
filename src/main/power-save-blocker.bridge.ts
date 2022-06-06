import {ipcMain, IpcMainInvokeEvent, powerSaveBlocker} from 'electron';
import {Bridge} from './bridge';

export class PowerSaveBlockerBridge implements Bridge {
    public register(): void {
        ipcMain.handle('eb.powerSaveBlocker.start', async (_: IpcMainInvokeEvent, type: 'prevent-app-suspension' | 'prevent-display-sleep') => {
            return powerSaveBlocker.start(type);
        });
        ipcMain.handle('eb.powerSaveBlocker.stop', async (_: IpcMainInvokeEvent, id: number) => {
            powerSaveBlocker.stop(id);
        });
        ipcMain.handle('eb.powerSaveBlocker.isStarted', async (_: IpcMainInvokeEvent, id: number) => {
            return powerSaveBlocker.isStarted(id);
        });
    }

    public release(): void {
        ipcMain.removeHandler('eb.powerSaveBlocker.start');
        ipcMain.removeHandler('eb.powerSaveBlocker.stop');
        ipcMain.removeHandler('eb.powerSaveBlocker.isStarted');
    }
}
