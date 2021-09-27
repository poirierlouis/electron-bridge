import { ipcMain, IpcMainInvokeEvent } from "electron";
import * as fs from "fs/promises";
import * as path from "path";
import { Bridge } from "./bridge";

interface StoreItem {
    key: string;
    store: any;
}

export class StoreBridge implements Bridge {
    private readonly rootPath: string;
    private path: string;
    private store: any;

    /**
     * Create a StoreBridge with a path to restrict stores' location.
     *
     * @param rootPath safe root path where to save stores.
     */
    constructor(rootPath: string) {
        this.rootPath = rootPath;
        this.path = path.join(this.rootPath, 'store.json');
        this.store = {};
    }

    public register(): void {
        ipcMain.handle('eb.store.withStore', async (_: IpcMainInvokeEvent, storePath: string) => {
            if (!storePath || storePath.length === 0) {
                storePath = 'store';
            }
            if (storePath.indexOf('\0') !== -1) {
                throw new Error(`<electron-bridge side="main" module="store" error="Protecting against Poison Null bytes!" />`);
            }
            this.path = path.resolve(this.rootPath, `${storePath.trim().toLowerCase()}.json`);
            if (this.path.indexOf(this.rootPath) !== 0) {
                this.path = path.join(this.rootPath, 'store.json');
                throw new Error(`<electron-bridge side="main" module="store" error="Preventing directory traversal!" />`);
            }
            try {
                        const data: string = await fs.readFile(this.path, {encoding: 'utf8', flag: 'r'});

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
        return fs.writeFile(this.path, JSON.stringify(this.store), {encoding: 'utf8', flag: 'w'});
    }
}
