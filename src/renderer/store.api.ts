
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
export interface StoreApi {
    /**
     * Open a store to interact with; e.g. `relative/path/to/my-store`.
     *
     * @param storePath of the file to create / open; default 'store'.
     */
    withStore(storePath?: string): Promise<void>;
    /**
     * Set a value into current store.
     *
     * @param key where to set new value / or replace current value.
     * @param value to set.
     */
    set(key: string, value: any): Promise<void>;
    /**
     * Returns if key exists or not.
     *
     * @param key to check if it exists.
     * @returns true if key exists, false otherwise.
     */
    has(key: string): Promise<boolean>;
    /**
     * Returns value at given key's position.
     *
     * @param key where to retrieve value.
     * @return value found at key position, undefined otherwise.
     */
    get(key: string): Promise<any | undefined>;
    /**
     * Delete key from current store.
     * If key is not found, nothing happens.
     *
     * @param key to delete.
     */
    delete(key: string): Promise<void>;
}
