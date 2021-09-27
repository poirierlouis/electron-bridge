import { dialog, ipcMain, IpcMainInvokeEvent, MessageBoxOptions, OpenDialogOptions, SaveDialogOptions } from "electron";
import { Bridge } from "./bridge";

export class DialogBridge implements Bridge {
    public register(): void {
        ipcMain.handle('eb.dialog.showOpenDialog', async (_: IpcMainInvokeEvent, options: OpenDialogOptions) => {
            return dialog.showOpenDialog(options);
        });
        ipcMain.handle('eb.dialog.showSaveDialog', async (_: IpcMainInvokeEvent, options: SaveDialogOptions) => {
            return dialog.showSaveDialog(options);
        });
        ipcMain.handle('eb.dialog.showMessageBox', async (_: IpcMainInvokeEvent, options: MessageBoxOptions) => {
            return dialog.showMessageBox(options);
        });
        ipcMain.handle('eb.dialog.showErrorBox', (_: IpcMainInvokeEvent, title: string, content: string) => {
            dialog.showErrorBox(title, content);
        });
    }

    public release(): void {
        ipcMain.removeHandler('eb.dialog.showOpenDialog');
        ipcMain.removeHandler('eb.dialog.showSaveDialog');
        ipcMain.removeHandler('eb.dialog.showMessageBox');
        ipcMain.removeHandler('eb.dialog.showErrorBox');
    }
}
