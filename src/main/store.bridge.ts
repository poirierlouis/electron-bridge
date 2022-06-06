import {ipcMain, IpcMainInvokeEvent, safeStorage} from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import {Bridge} from './bridge';

interface StoreItem {
    key: string;
    store: any;
}

export class StoreBridge implements Bridge {
    private readonly rootPath: string;
    private path: string;
    private store: any;
    private isEncrypted: boolean;

    /**
     * Create a StoreBridge with a path to restrict stores' location.
     *
     * @param rootPath safe root path where to save stores.
     */
    constructor(rootPath: string) {
        this.rootPath = rootPath;
        this.isEncrypted = false;
        this.path = path.join(this.rootPath, 'store.json');
        this.store = {};
    }

    public register(): void {
        ipcMain.handle('eb.store.withStore', async (_: IpcMainInvokeEvent, storePath: string, isEncrypted: boolean) => {
            if (!storePath || storePath.length === 0) {
                storePath = 'store';
            }
            if (isEncrypted != true) {
                isEncrypted = false;
            } else {
                isEncrypted = safeStorage.isEncryptionAvailable();
            }
            if (storePath.indexOf('\0') !== -1) {
                throw new Error(`<electron-bridge side="main" module="store" error="Protecting against Poison Null bytes!" />`);
            }
            storePath = path.resolve(this.rootPath, `${storePath.trim().toLowerCase()}.json`);
            if (storePath.indexOf(this.rootPath) !== 0) {
                throw new Error(`<electron-bridge side="main" module="store" error="Preventing directory traversal!" />`);
            }
            this.path = storePath;
            this.isEncrypted = isEncrypted;
            try {
                const data: string = await this.load();

                this.store = JSON.parse(data);
            } catch (error) {
                this.store = {};
            }
        });
        ipcMain.handle('eb.store.set', async (_: IpcMainInvokeEvent, key: string, value: any) => {
            const item: StoreItem | undefined = this.traverse(key, true);
            if (!item) {
                return;
            }
            item.store[item.key] = value;
            await this.update();
        });
        ipcMain.handle('eb.store.has', async (_: IpcMainInvokeEvent, key: string) => {
            const item: StoreItem | undefined = this.traverse(key);
            return !!item;
        });
        ipcMain.handle('eb.store.get', async (_: IpcMainInvokeEvent, key: string) => {
            const item: StoreItem | undefined = this.traverse(key);
            if (!item) {
                return undefined;
            }
            return item.store[item.key];
        });
        ipcMain.handle('eb.store.delete', async (_: IpcMainInvokeEvent, key: string) => {
            const item: StoreItem | undefined = this.traverse(key);
            if (!item) {
                return;
            }
            delete item.store[item.key];
            await this.update();
        });
    }

    public release(): void {
        ipcMain.removeHandler('eb.store.withStore');
        ipcMain.removeHandler('eb.store.set');
        ipcMain.removeHandler('eb.store.has');
        ipcMain.removeHandler('eb.store.get');
        ipcMain.removeHandler('eb.store.delete');
    }

    /**
     * Traverse current store using chained dot notation.
     *
     * @param key to traverse to.
     * @param canWrite when true, it creates missing keys while traversing.
     *                 When false, abort traversing when a key is not defined.
     * @returns a store item containing found key and store reference, undefined if key is not found.
     */
    private traverse(key: any, canWrite: boolean = false): StoreItem | undefined {
        const keys: string[] = key.split('.');
        let store: any = this.store;
        let i: number;
        for (i = 0; i < keys.length - 1 && (canWrite || (!canWrite && keys[i] in store)); i++) {
            if (canWrite && !(keys[i] in store)) {
                store[keys[i]] = {};
            }
            store = store[keys[i]];
        }

        if (i !== keys.length - 1) {
            return undefined;
        }

        return {
            key: keys[i],
            store: store
        };
    }

    private update(): Promise<void> {
        let data: string = JSON.stringify(this.store);
        if (this.isEncrypted) {
            const buffer: Buffer = safeStorage.encryptString(data);

            return fs.writeFile(this.path, buffer, {flag: 'w'});
        }

        return fs.writeFile(this.path, data, {encoding: 'utf8', flag: 'w'});
    }

    private async load(): Promise<string> {
        if (this.isEncrypted) {
            const buffer: Buffer = await fs.readFile(this.path, {flag: 'r'});

            return safeStorage.decryptString(buffer);
        }

        return fs.readFile(this.path, {encoding: 'utf8', flag: 'r'});
    }
}
