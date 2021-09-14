import {ipcRenderer} from 'electron';
import {BridgeModule} from "./bridge.module";

export const PowerMonitorModule: BridgeModule = {
    name: 'powerMonitor',
    readonly: true,
    api: {
        getSystemIdleState: async (idleThreshold) => {
            return await ipcRenderer.invoke('eb.powerMonitor.getSystemIdleState', idleThreshold);
        },
        getSystemIdleTime: async () => {
            return await ipcRenderer.invoke('eb.powerMonitor.getSystemIdleTime');
        },
        isOnBatteryPower: async () => {
            return await ipcRenderer.invoke('eb.powerMonitor.isOnBatteryPower');
        }
        /*
        suspend: async () => {
            return await ipcRenderer.
        }
        */
    }
};
