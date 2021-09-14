import {ipcRenderer} from 'electron';
import {BridgeModule} from "./bridge.module";

export const PathModule: BridgeModule = {
    name: 'path',
    readonly: true,
    api: {
        isAbsolute: async (path: string) => {
            return await ipcRenderer.invoke('eb.path.isAbsolute', path);
        },
        join: async (...paths: string[]) => {
            return await ipcRenderer.invoke('eb.path.join', paths);
        },
        normalize: async (path: string) => {
            return await ipcRenderer.invoke('eb.path.normalize', path);
        },
        parse: async (path: string) => {
            return await ipcRenderer.invoke('eb.path.parse', path);
        },
        relative: async (from: string, to: string) => {
            return await ipcRenderer.invoke('eb.path.relative', from, to);
        },
    }
};
