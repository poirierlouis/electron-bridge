import {ipcRenderer} from 'electron';
import {BaseEncodingOptions, Mode, OpenMode, PathLike} from '../renderer/file-system.api';
import {BridgeModule} from './bridge.module';

export const FileSystemModule: BridgeModule = {
    name: 'fileSystem',
    readonly: false,
    api: {
        readFile: async (path: PathLike, options: { encoding?: BufferEncoding | undefined, flag?: OpenMode | undefined } | BufferEncoding) => {
            return await ipcRenderer.invoke('eb.fileSystem.readFile', path, options);
        },
        writeFile: async (path: PathLike, data: Uint8Array | string, options: BaseEncodingOptions & { mode?: Mode | undefined, flag?: OpenMode | undefined } | BufferEncoding | null) => {
            return await ipcRenderer.invoke('eb.fileSystem.writeFile', path, data, options);
        }
    }
};
