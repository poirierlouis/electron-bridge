import {dialog, ipcMain} from 'electron';
import {Bridge} from "./bridge";

export class DialogBridge implements Bridge {

    public register(): void {
        ipcMain.handle('eb.dialog.showOpenDialog', async (event, options) => {
            return await dialog.showOpenDialog(options);
        });

        ipcMain.handle('eb.dialog.showSaveDialog', async (event, options) => {
            return await dialog.showSaveDialog(options);
        });

        ipcMain.handle('eb.dialog.showMessageBox', async (event, options) => {
            return await dialog.showMessageBox(options);
        });

        ipcMain.handle('eb.dialog.showErrorBox', (event, title, content) => {
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
