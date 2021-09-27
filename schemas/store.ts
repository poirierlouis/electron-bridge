import * as path from 'path';
import * as fs from 'fs/promises';
import {Schema} from 'electron-bridge-cli';

interface StoreItem {

    key: string;
    store: any;

}

/**
 * Store data in user's application directory with JSON format (JSON.stringify / JSON.parse).
 * Important: you must only interact with one store at time!
 *
 * You can use chained dot notation with `set`, `has`, `get`, and `delete` operations like in examples bellow:
 * `store.set('peoples', {});`
 * `store.set('peoples.42', {id: 42, name: Grogu, age: NaN, force: Infinite});`
 * `store.set('peoples.42.age', 50);`
 * `console.assert(await store.has('peoples.42') === true);`
 * `const age: number = await store.get('peoples.42.age');`
 *
 */
@Schema(true)
export class Store {

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

    /**
     * Open a store to interact with; e.g. `relative/path/to/my-store`.
     *
     * @param storePath of the file to create / open; default 'store'.
     */
    public async withStore(storePath?: string): Promise<void> {
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
        return fs.writeFile(this.path, JSON.stringify(this.store), {encoding: 'utf8', flag: 'w'});
    }

}
