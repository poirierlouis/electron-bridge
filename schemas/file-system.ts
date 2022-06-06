import * as fs from 'fs/promises';
import {URL} from 'url';
import {Schema} from '@lpfreelance/electron-bridge-cli';

export type PathLike = string | Buffer | URL;
export type BufferEncoding =
    'ascii'
    | 'utf8'
    | 'utf-8'
    | 'utf16le'
    | 'ucs2'
    | 'ucs-2'
    | 'base64'
    | 'latin1'
    | 'binary'
    | 'hex';
export type OpenMode = number | string;
export type Mode = number | string;

export interface BaseEncodingOptions {
    encoding?: BufferEncoding | null | undefined;
}

/**
 * Simple wrapper for Node.js file system module; with only read / write operations.
 */
@Schema(false)
export class FileSystem {

    public async readFile(path: PathLike,
        options?: { encoding?: BufferEncoding | undefined, flag?: OpenMode | undefined } | BufferEncoding): Promise<Buffer | string> {
        return fs.readFile(path, options);
    }

    public async writeFile(path: PathLike, data: Uint8Array | string,
        options?: BaseEncodingOptions & { mode?: Mode | undefined, flag?: OpenMode | undefined } | BufferEncoding | null): Promise<void> {
        return fs.writeFile(path, data, options);
    }

}
