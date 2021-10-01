import "electron-bridge/renderer";
import {AbstractTab} from "./abstract.tab";

export class PowerMonitorTab extends AbstractTab {

    constructor() {
        super('power-monitor');
    }

    public load(): void {
        window.powerMonitor.isOnBatteryPower().then(this.updateIsOnBatteryPower.bind(this));
        window.powerMonitor.onBattery(() => this.updateIsOnBatteryPower(true));
        window.powerMonitor.onAc(() => this.updateIsOnBatteryPower(false));
        window.powerMonitor.onLockScreen(() => this.appendEvent('receive: lock-screen'));
        window.powerMonitor.onUnlockScreen(() => this.appendEvent('receive: unlock-screen'));
        window.powerMonitor.onSuspend(() => this.appendEvent('receive: suspend'));
        window.powerMonitor.onResume(() => this.appendEvent('receive: resume'));
    }

    public onHide(): void {

    }

    public onShow(): void {

    }

    private appendEvent(message: string) {
        const $events: HTMLTextAreaElement = document.querySelector('#power-monitor #events');

        $events.value = `${message}\r\n${$events.value}`;
    }

    private updateIsOnBatteryPower(isOnBatteryPower: boolean) {
        const $isOnBatteryPower = document.querySelector('#power-monitor #isOnBatteryPower');

        $isOnBatteryPower.innerHTML = (isOnBatteryPower) ? 'yes' : 'no';
        this.appendEvent((isOnBatteryPower) ? 'receive: battery' : 'receive: ac');
    }


}
