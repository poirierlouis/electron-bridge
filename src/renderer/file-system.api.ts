export type PathLike = string | Buffer | URL;
export type BufferEncoding = 'ascii'
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
export interface FileSystemApi {
    readFile(path: PathLike, options?: { encoding?: BufferEncoding | undefined, flag?: OpenMode | undefined } | BufferEncoding): Promise<Buffer | string>;

    writeFile(path: PathLike, data: Uint8Array | string, options?: BaseEncodingOptions & { mode?: Mode | undefined, flag?: OpenMode | undefined } | BufferEncoding | null): Promise<void>;
}
