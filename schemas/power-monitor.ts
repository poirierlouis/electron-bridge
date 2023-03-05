import {BrowserWindow, powerMonitor} from 'electron';
import {EventListener, Schema} from '@lpfreelance/electron-bridge-cli';

/**
 * Monitor power state changes.
 */
@Schema(true)
export class PowerMonitor {

    private static events: string[] = [
        'suspend',
        'resume',
        'on-ac',
        'on-battery',
        'lock-screen',
        //'shutdown',
        'unlock-screen',
        'user-did-become-active',
        'user-did-resign-active'
    ];

    constructor(private win: BrowserWindow) {

    }

    public register(): void {
        PowerMonitor.events.forEach(event => {
            powerMonitor.on(<any>event, () => this.win.webContents.send(`eb.powerMonitor.${event}`));
        });
        powerMonitor.on('shutdown', (event: Event) => {
            this.win.webContents.send(`eb.powerMonitor.shutdown`, event);
        });
    }

    public release(): void {
        PowerMonitor.events.forEach(event => {
            powerMonitor.off(<any>event, () => this.win.webContents.send(`eb.powerMonitor.${event}`));
        });
        powerMonitor.off('shutdown', (event: Event) => {
            this.win.webContents.send(`eb.powerMonitor.shutdown`, event);
        });
    }

    public async getSystemIdleState(idleThreshold: number): Promise<'active' | 'idle' | 'locked' | 'unknown'> {
        return powerMonitor.getSystemIdleState(idleThreshold);
    }

    public async getSystemIdleTime(): Promise<number> {
        return powerMonitor.getSystemIdleTime();
    }

    public async isOnBatteryPower(): Promise<boolean> {
        return powerMonitor.isOnBatteryPower();
    }

    @EventListener('suspend')
    public onSuspend(listener: Function): void {

    }

    @EventListener('resume')
    public onResume(listener: Function): void {

    }

    @EventListener('on-ac')
    public onAc(listener: Function): void {

    }

    @EventListener('on-battery')
    public onBattery(listener: Function): void {

    }

    @EventListener('shutdown')
    public onShutdown(listener: (event: Event) => void): void {

    }

    @EventListener('lock-screen')
    public onLockScreen(listener: Function): void {

    }

    @EventListener('unlock-screen')
    public onUnlockScreen(listener: Function): void {

    }

    @EventListener('user-did-become-active')
    public onUserDidBecomeActive(listener: Function): void {

    }

    @EventListener('user-did-resign-active')
    public onUserDidResignActive(listener: Function): void {

    }

}
