import {ipcMain} from 'electron';
import * as fs from "fs/promises";
import * as path from "path";
import {Bridge} from "./bridge";

export class StoreBridge implements Bridge {

    private readonly userPath: string;

    private path: string;
    private store: any;

    constructor(app: Electron.App) {
        this.userPath = app.getPath('userData');
        this.path = path.join(this.userPath, 'store.json');
        this.store = {};
    }

    public register(): void {
        ipcMain.handle('eb.store.store', async (event, name) => {
            if (!name || name.length === 0) {
                name = 'store';
            }
            if (name.indexOf('\0') !== -1) {
                throw new Error(`<electron-bridge side="main" module="store" error="Protecting against Poison Null bytes!" />`);
            }
            this.path = path.join(this.userPath, `${name.trim().toLowerCase()}.json`);
            if (this.path.indexOf(this.userPath) !== 0) {
                this.path = path.join(this.userPath, 'store.json');
                throw new Error(`<electron-bridge side="main" module="store" error="Preventing directory traversal!" />`);
            }
            try {
                const data: string = await fs.readFile(this.path, {encoding: 'utf8', flag: 'r'});

                this.store = JSON.parse(data);
            } catch (error) {
                this.store = {};
            }
        });
        ipcMain.handle('eb.store.set', async (event, key, value) => {
            const item: {key: string, store: any} | undefined = this.traverse(key, true);

            if (!item) {
                return;
            }
            item.store[item.key] = value;
            await this.update();
        });
        ipcMain.handle('eb.store.has', async (event, key) => {
            const item: {key: string, store: any} | undefined = this.traverse(key);

            return !!item;
        });
        ipcMain.handle('eb.store.get', async (event, key) => {
            const item: {key: string, store: any} | undefined = this.traverse(key);

            if (!item) {
                return undefined;
            }
            return item.store[item.key];
        });
        ipcMain.handle('eb.store.delete', async (event, key) => {
            const item: {key: string, store: any} | undefined = this.traverse(key);

            if (!item) {
                return;
            }
            delete item.store[item.key];
            await this.update();
        });
    }

    public release(): void {
        ipcMain.removeHandler('eb.store.store');
        ipcMain.removeHandler('eb.store.set');
        ipcMain.removeHandler('eb.store.has');
        ipcMain.removeHandler('eb.store.get');
        ipcMain.removeHandler('eb.store.delete');
    }

    private traverse(key: any, canWrite: boolean = false): {key: string, store: any} | undefined {
        const keys: string[] = key.split('.');
        let store: any;
        let i: number;

        store = this.store;
        for (i = 0; i < keys.length - 1 && (canWrite || (!canWrite && keys[i] in store)); i++) {
            if (canWrite && !(keys[i] in store)) {
                store[keys[i]] = {};
            }
            store = store[keys[i]];
        }
        if (i !== keys.length - 1) {
            return undefined;
        }
        return {key: keys[i], store: store};
    }

    private update(): Promise<void> {
        return fs.writeFile(this.path, JSON.stringify(this.store), {encoding: 'utf8', flag: 'w'});
    }

}
