import * as path from 'path';
import * as fs from 'fs/promises';
import {safeStorage} from 'electron';
import {Schema} from '@lpfreelance/electron-bridge-cli';

interface StoreItem {

    key: string;
    store: any;

}

/**
 * Store data in user's application directory with JSON format (JSON.stringify / JSON.parse).
 * You can use OS solution to encrypt / decrypt data per store if available on device.
 * Important: you must only interact with one store at time!
 *
 * You can use chained dot notation with `set`, `has`, `get`, and `delete` operations like in example bellow:
 * ```javascript
 * () async {
 *     await store.set('people', {});
 *     await store.set('people.42', {id: 42, name: Grogu, age: NaN, force: Infinite});
 *     await store.set('people.42.age', 50);
 *
 *     const someone = await store.has('people.42');
 *     console.assert(someone === true);
 *
 *     const age: number = await store.get('people.42.age');
 *     console.assert(age === 50);
 * }
 * ```
 */
@Schema(true)
export class Store {

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

    /**
     * Open a store to interact with; e.g. `relative/path/to/my-store`.
     *
     * @param storePath of the file to create / open; default 'store'.
     * @param isEncrypted true will encrypt / decrypt data using OS solution if available, false to store plain data.
     * Default false. If *isEncrypted* is true and feature is not available on device, will silently fall back to false.
     */
    public async withStore(storePath?: string, isEncrypted?: boolean): Promise<void> {
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
    }

    /**
     * Set a value into current store.
     *
     * @param key where to set new value / or replace current value.
     * @param value to set.
     */
    public async set(key: string, value: any): Promise<void> {
        const item: StoreItem | undefined = this.traverse(key, true);

        if (!item) {
            return;
        }
        item.store[item.key] = value;
        await this.update();
    }

    /**
     * Returns if key exists or not.
     *
     * @param key to check if it exists.
     * @returns true if key exists, false otherwise.
     */
    public async has(key: string): Promise<boolean> {
        const item: StoreItem | undefined = this.traverse(key);

        return !!item;
    }

    /**
     * Returns value at given key's position.
     *
     * @param key where to retrieve value.
     * @return value found at key position, undefined otherwise.
     */
    public async get(key: string): Promise<any | undefined> {
        const item: StoreItem | undefined = this.traverse(key);

        if (!item) {
            return undefined;
        }
        return item.store[item.key];
    }

    /**
     * Delete key from current store.
     * If key is not found, nothing happens.
     *
     * @param key to delete.
     */
    public async delete(key: string): Promise<void> {
        const item: StoreItem | undefined = this.traverse(key);

        if (!item) {
            return;
        }
        delete item.store[item.key];
        await this.update();
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
