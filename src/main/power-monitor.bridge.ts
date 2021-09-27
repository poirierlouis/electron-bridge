import { BrowserWindow, ipcMain, IpcMainInvokeEvent, powerMonitor } from "electron";
import { Bridge } from "./bridge";

export class PowerMonitorBridge implements Bridge {
    private static events: string[] = [
                'suspend',
                'resume',
                'on-ac',
                'on-battery',
                'lock-screen',
                'unlock-screen',
                'user-did-become-active',
                'user-did-resign-active'
            ];

    constructor(private win: BrowserWindow) {
    }

    public register(): void {
        PowerMonitorBridge.events.forEach(event => {
            powerMonitor.on(<any>event, () => this.win.webContents.send(`eb.powerMonitor.${event}`));
        });
        powerMonitor.on('shutdown', (event: Event) => this.win.webContents.send('eb.powerMonitor.shutdown', event));
        ipcMain.handle('eb.powerMonitor.getSystemIdleState', async (_: IpcMainInvokeEvent, idleThreshold: number) => {
            return powerMonitor.getSystemIdleState(idleThreshold);
        });
        ipcMain.handle('eb.powerMonitor.getSystemIdleTime', async () => {
            return powerMonitor.getSystemIdleTime();
        });
        ipcMain.handle('eb.powerMonitor.isOnBatteryPower', async () => {
            return powerMonitor.isOnBatteryPower();
        });
    }

    public release(): void {
        PowerMonitorBridge.events.forEach(event => {
            powerMonitor.off(<any>event, () => this.win.webContents.send(`eb.powerMonitor.${event}`));
        });
        powerMonitor.off('shutdown', (event: Event) => this.win.webContents.send('eb.powerMonitor.shutdown', event));
        ipcMain.removeHandler('eb.powerMonitor.getSystemIdleState');
        ipcMain.removeHandler('eb.powerMonitor.getSystemIdleTime');
        ipcMain.removeHandler('eb.powerMonitor.isOnBatteryPower');
    }
}
