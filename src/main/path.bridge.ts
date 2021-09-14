import {ipcMain} from 'electron';
import * as path from 'path';
import {Bridge} from "./bridge";

export class PathBridge implements Bridge {

    public register(): void {
        ipcMain.handle('eb.path.isAbsolute', (event, arg) => {
            return path.isAbsolute(arg);
        });
        ipcMain.handle('eb.path.join', (event, ...paths) => {
            return path.join(...paths);
        });
        ipcMain.handle('eb.path.normalize', (event, arg) => {
            return path.normalize(arg);
        });
        ipcMain.handle('eb.path.parse', (event, arg) => {
            return path.parse(arg);
        });
        ipcMain.handle('eb.path.relative', (event, from, to) => {
            return path.relative(from, to);
        });
    }

    public release(): void {

    }

}
