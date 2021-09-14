import {BrowserWindow, ipcMain, powerMonitor} from 'electron';
import {Bridge} from "./bridge";

export class PowerMonitorBridge implements Bridge {

    private readonly events: string[];

    constructor(private win: BrowserWindow) {
        this.events = [
            'suspend',
            'resume',
            'on-ac',
            'on-battery',
            'shutdown',
            'lock-screen',
            'unlock-screen',
            'user-did-become-active',
            'user-did-resign-active'
        ];
    }

    public register(): void {
        this.events.forEach(event => powerMonitor.on(<any>event, () => this.win.webContents.send(event)));
        ipcMain.handle('eb.powerMonitor.getSystemIdleState', (event, idleThreshold) => {
            return powerMonitor.getSystemIdleState(idleThreshold);
        });
        ipcMain.handle('eb.powerMonitor.getSystemIdleTime', () => {
            return powerMonitor.getSystemIdleTime();
        });
        ipcMain.handle('eb.powerMonitor.isOnBatteryPower', () => {
            return powerMonitor.isOnBatteryPower();
        });
    }

    public release(): void {
        this.events.forEach(event => powerMonitor.off(<any>event, () => this.win.webContents.send(event)));
        ipcMain.removeHandler('eb.powerMonitor.getSystemIdleState');
        ipcMain.removeHandler('eb.powerMonitor.getSystemIdleTime');
        ipcMain.removeHandler('eb.powerMonitor.isOnBatteryPower');
    }

}
