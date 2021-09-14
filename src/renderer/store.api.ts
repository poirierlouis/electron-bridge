export interface StoreApi {

    store(name?: string): Promise<void>;
    set(key: string, value: any): Promise<void>;
    has(key: string): Promise<boolean>;
    get(key: string): Promise<any>;
    delete(key: string): Promise<void>;

}
