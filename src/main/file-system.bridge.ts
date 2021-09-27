import { ipcMain, IpcMainInvokeEvent } from "electron";
import * as fs from "fs/promises";
import { BaseEncodingOptions, Mode, OpenMode, PathLike } from "original-fs";
import { Bridge } from "./bridge";

export class FileSystemBridge implements Bridge {
    public register(): void {
        ipcMain.handle('eb.fileSystem.readFile', async (_: IpcMainInvokeEvent, path: PathLike, options: {encoding?: BufferEncoding | undefined, flag?: OpenMode | undefined} | BufferEncoding) => {
            return fs.readFile(path, options);
        });
        ipcMain.handle('eb.fileSystem.writeFile', async (_: IpcMainInvokeEvent, path: PathLike, data: Uint8Array | string, options: BaseEncodingOptions & {mode?: Mode | undefined, flag?: OpenMode | undefined} | BufferEncoding | null) => {
            return fs.writeFile(path, data, options);
        });
    }

    public release(): void {
        ipcMain.removeHandler('eb.fileSystem.readFile');
        ipcMain.removeHandler('eb.fileSystem.writeFile');
    }
}
