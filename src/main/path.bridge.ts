import {ipcMain, IpcMainInvokeEvent} from 'electron';
import * as nodePath from 'path';
import {FormatInputPathObject} from '../renderer/path.api';
import {Bridge} from './bridge';

export class PathBridge implements Bridge {
    public register(): void {
        ipcMain.handle('eb.path.basename', async (_: IpcMainInvokeEvent, path: string, ext: string) => {
            return nodePath.basename(path, ext);
        });
        ipcMain.handle('eb.path.delimiter', async () => {
            return nodePath.delimiter;
        });
        ipcMain.handle('eb.path.dirname', async (_: IpcMainInvokeEvent, path: string) => {
            return nodePath.dirname(path);
        });
        ipcMain.handle('eb.path.extname', async (_: IpcMainInvokeEvent, path: string) => {
            return nodePath.extname(path);
        });
        ipcMain.handle('eb.path.format', async (_: IpcMainInvokeEvent, obj: FormatInputPathObject) => {
            return nodePath.format(obj);
        });
        ipcMain.handle('eb.path.isAbsolute', async (_: IpcMainInvokeEvent, path: string) => {
            return nodePath.isAbsolute(path);
        });
        ipcMain.handle('eb.path.join', async (_: IpcMainInvokeEvent, paths: string[]) => {
            return nodePath.join(...paths);
        });
        ipcMain.handle('eb.path.normalize', async (_: IpcMainInvokeEvent, path: string) => {
            return nodePath.normalize(path);
        });
        ipcMain.handle('eb.path.parse', async (_: IpcMainInvokeEvent, path: string) => {
            return nodePath.parse(path);
        });
        ipcMain.handle('eb.path.relative', async (_: IpcMainInvokeEvent, from: string, to: string) => {
            return nodePath.relative(from, to);
        });
        ipcMain.handle('eb.path.resolve', async (_: IpcMainInvokeEvent, pathSegments: string[]) => {
            return nodePath.resolve(...pathSegments);
        });
        ipcMain.handle('eb.path.sep', async () => {
            return nodePath.sep;
        });
        ipcMain.handle('eb.path.toNamespacedPath', async (_: IpcMainInvokeEvent, path: string) => {
            return nodePath.toNamespacedPath(path);
        });
    }

    public release(): void {
        ipcMain.removeHandler('eb.path.basename');
        ipcMain.removeHandler('eb.path.delimiter');
        ipcMain.removeHandler('eb.path.dirname');
        ipcMain.removeHandler('eb.path.extname');
        ipcMain.removeHandler('eb.path.format');
        ipcMain.removeHandler('eb.path.isAbsolute');
        ipcMain.removeHandler('eb.path.join');
        ipcMain.removeHandler('eb.path.normalize');
        ipcMain.removeHandler('eb.path.parse');
        ipcMain.removeHandler('eb.path.relative');
        ipcMain.removeHandler('eb.path.resolve');
        ipcMain.removeHandler('eb.path.sep');
        ipcMain.removeHandler('eb.path.toNamespacedPath');
    }
}
