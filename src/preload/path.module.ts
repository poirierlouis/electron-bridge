import { ipcRenderer } from "electron";
import { FormatInputPathObject } from "../renderer/path.api";
import { BridgeModule } from "./bridge.module";

export const PathModule: BridgeModule = {
    name: 'path',
    readonly: true,
    api: {
        basename: async (path: string, ext: string) => {
            return await ipcRenderer.invoke('eb.path.basename', path, ext);
        },
        delimiter: async () => {
            return await ipcRenderer.invoke('eb.path.delimiter');
        },
        dirname: async (path: string) => {
            return await ipcRenderer.invoke('eb.path.dirname', path);
        },
        extname: async (path: string) => {
            return await ipcRenderer.invoke('eb.path.extname', path);
        },
        format: async (obj: FormatInputPathObject) => {
            return await ipcRenderer.invoke('eb.path.format', obj);
        },
        isAbsolute: async (path: string) => {
            return await ipcRenderer.invoke('eb.path.isAbsolute', path);
        },
        join: async (paths: string[]) => {
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
        resolve: async (pathSegments: string[]) => {
            return await ipcRenderer.invoke('eb.path.resolve', pathSegments);
        },
        sep: async () => {
            return await ipcRenderer.invoke('eb.path.sep');
        },
        toNamespacedPath: async (path: string) => {
            return await ipcRenderer.invoke('eb.path.toNamespacedPath', path);
        }
    }
};