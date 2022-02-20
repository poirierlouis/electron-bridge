
/**
 * Store data in user's application directory with JSON format (JSON.stringify / JSON.parse).
 * You can use OS solution to encrypt / decrypt data per store if available on device.
 * Important: you must only interact with one store at time!
 *
 * You can use chained dot notation with `set`, `has`, `get`, and `delete` operations like in example bellow:
 * ```javascript
 * async () => {
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
export interface StoreApi {
    /**
     * Open a store to interact with; e.g. `relative/path/to/my-store`.
     *
     * @param storePath of the file to create / open; default 'store'.
     * @param isEncrypted true will encrypt / decrypt data using OS solution if available, false to store plain data.
     * Default false. If *isEncrypted* is true and feature is not available on device, will silently fall back to false.
     */
    withStore(storePath?: string, isEncrypted?: boolean): Promise<void>;
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
