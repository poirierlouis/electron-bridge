import {ipcRenderer, IpcRendererEvent} from 'electron';
import {BridgeModule} from './bridge.module';

export const PowerMonitorModule: BridgeModule = {
    name: 'powerMonitor',
    readonly: true,
    api: {
        getSystemIdleState: async (idleThreshold: number) => {
            return await ipcRenderer.invoke('eb.powerMonitor.getSystemIdleState', idleThreshold);
        },
        getSystemIdleTime: async () => {
            return await ipcRenderer.invoke('eb.powerMonitor.getSystemIdleTime');
        },
        isOnBatteryPower: async () => {
            return await ipcRenderer.invoke('eb.powerMonitor.isOnBatteryPower');
        },
        onSuspend: (listener: Function) => {
            ipcRenderer.on('eb.powerMonitor.suspend', () => {
                listener();
            });
        },
        onResume: (listener: Function) => {
            ipcRenderer.on('eb.powerMonitor.resume', () => {
                listener();
            });
        },
        onAc: (listener: Function) => {
            ipcRenderer.on('eb.powerMonitor.on-ac', () => {
                listener();
            });
        },
        onBattery: (listener: Function) => {
            ipcRenderer.on('eb.powerMonitor.on-battery', () => {
                listener();
            });
        },
        onShutdown: (listener: (event: Event) => void) => {
            ipcRenderer.on('eb.powerMonitor.shutdown', (_: IpcRendererEvent, event: Event) => {
                listener(event);
            });
        },
        onLockScreen: (listener: Function) => {
            ipcRenderer.on('eb.powerMonitor.lock-screen', () => {
                listener();
            });
        },
        onUnlockScreen: (listener: Function) => {
            ipcRenderer.on('eb.powerMonitor.unlock-screen', () => {
                listener();
            });
        },
        onUserDidBecomeActive: (listener: Function) => {
            ipcRenderer.on('eb.powerMonitor.user-did-become-active', () => {
                listener();
            });
        },
        onUserDidResignActive: (listener: Function) => {
            ipcRenderer.on('eb.powerMonitor.user-did-resign-active', () => {
                listener();
            });
        }
    }
};
