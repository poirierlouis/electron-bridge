import { ipcRenderer, MessageBoxOptions, OpenDialogOptions, SaveDialogOptions } from "electron";
import { BridgeModule } from "./bridge.module";

export const DialogModule: BridgeModule = {
    name: 'dialog',
    readonly: true,
    api: {
        showOpenDialog: async (options: OpenDialogOptions) => {
            return await ipcRenderer.invoke('eb.dialog.showOpenDialog', options);
        },
        showSaveDialog: async (options: SaveDialogOptions) => {
            return await ipcRenderer.invoke('eb.dialog.showSaveDialog', options);
        },
        showMessageBox: async (options: MessageBoxOptions) => {
            return await ipcRenderer.invoke('eb.dialog.showMessageBox', options);
        },
        showErrorBox: (title: string, content: string) => {
            ipcRenderer.invoke('eb.dialog.showErrorBox', title, content);
        }
    }
};