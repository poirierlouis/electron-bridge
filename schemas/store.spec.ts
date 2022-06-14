import * as fs from 'fs/promises';
import * as path from 'path';
import {safeStorage} from 'electron';
import {Store} from './store';

jest.mock('path');
jest.mock('fs');
jest.mock('fs/promises');

jest.mock('electron', () => ({
    safeStorage: {
        isEncryptionAvailable: jest.fn(),
        encryptString: jest.fn(),
        decryptString: jest.fn()
    }
}));

describe(Store, () => {
    const rootPath: string = '/home/force/';
    let schema: Store;

    beforeEach(() => {
        schema = new Store(rootPath);
    });

    afterEach(() => {
        // @ts-ignore
        fs.readFile.mockClear();
        // @ts-ignore
        fs.writeFile.mockClear();
    });

    describe('Lifecycle', () => {
        it('should not implement register()', () => {
            // @ts-ignore
            expect(schema.register).toBeUndefined();
        });

        it('should not implement release()', () => {
            // @ts-ignore
            expect(schema.release).toBeUndefined();
        });
    });

    describe('withStore(path, isEncrypted)', () => {
        afterEach(() => {
            // @ts-ignore
            path.resolve.mockClear();
        });

        it('GIVEN encryption feature is disabled ' +
            'WHEN calling withStore() ' +
            'THEN load file at default path \'./store.json\' with UTF8 encoding', async () => {
            // @ts-ignore
            path.resolve.mockReturnValueOnce(rootPath + 'store.json');
            // @ts-ignore
            safeStorage.isEncryptionAvailable.mockReturnValue(false);

            await schema.withStore();

            expect(fs.readFile).toHaveBeenCalledWith(rootPath + 'store.json', {encoding: 'utf8', flag: 'r'});
        });

        it('GIVEN encryption feature is enabled ' +
            'WHEN calling withStore() ' +
            'THEN load file at default path \'./store.json\' with UTF8 encoding', async () => {
            // @ts-ignore
            path.resolve.mockReturnValueOnce(rootPath + 'store.json');
            // @ts-ignore
            safeStorage.isEncryptionAvailable.mockReturnValue(true);

            await schema.withStore();

            expect(fs.readFile).toHaveBeenCalledWith(rootPath + 'store.json', {encoding: 'utf8', flag: 'r'});
        });

        it('GIVEN encryption feature is disabled ' +
            'WHEN calling withStore(undefined, true) ' +
            'THEN load file at default path \'./store.json\' with UTF8 encoding', async () => {
            // @ts-ignore
            path.resolve.mockReturnValueOnce(rootPath + 'store.json');
            // @ts-ignore
            safeStorage.isEncryptionAvailable.mockReturnValue(false);

            await schema.withStore(undefined, true);

            expect(fs.readFile).toHaveBeenCalledWith(rootPath + 'store.json', {encoding: 'utf8', flag: 'r'});
        });

        it('GIVEN encryption feature is enabled ' +
            'WHEN calling withStore(undefined, true) ' +
            'THEN load file at default path \'./store.json\' with binary encoding', async () => {
            const buffer: ArrayBuffer = new ArrayBuffer(42);

            // @ts-ignore
            path.resolve.mockReturnValueOnce(rootPath + 'store.json');
            // @ts-ignore
            safeStorage.isEncryptionAvailable.mockReturnValue(true);
            // @ts-ignore
            safeStorage.decryptString.mockReturnValue(undefined);
            // @ts-ignore
            fs.readFile.mockReturnValue(buffer);

            await schema.withStore(undefined, true);

            expect(fs.readFile).toHaveBeenCalledWith(rootPath + 'store.json', {flag: 'r'});
            expect(safeStorage.decryptString).toHaveBeenCalledWith(buffer);
        });

        it('GIVEN path using Poison Null bytes attack ' +
            'WHEN calling withStore(\'somewhere.so\\0\') ' +
            'THEN throw an error', async () => {
            expect.assertions(1);
            // @ts-ignore
            safeStorage.isEncryptionAvailable.mockReturnValue(false);

            await expect(schema.withStore('somewhere.so\0')).rejects.toThrowError();
        });

        it('GIVEN path with spaces and tabs ' +
            'WHEN calling withStore(\'  config/db\\t\') ' +
            'THEN trim path, ' +
            'load file at path \'./config/db.json\' with UTF8 encoding', async () => {
            const storePath: string = '  config/db\t';

            // @ts-ignore
            path.resolve.mockReturnValueOnce(rootPath + `${storePath.trim()}.json`);
            // @ts-ignore
            safeStorage.isEncryptionAvailable.mockReturnValue(false);

            await schema.withStore(storePath);

            expect(path.resolve).toHaveBeenCalledWith(rootPath, `${storePath.trim()}.json`);
            expect(fs.readFile).toHaveBeenCalledWith(rootPath + `${storePath.trim()}.json`,
                {encoding: 'utf8', flag: 'r'});
        });

        it('GIVEN path with lower and upper cases ' +
            'WHEN calling withStore(\'config/DB\') ' +
            'THEN load file at path \'./config/DB.json\' with UTF8 encoding', async () => {
            const storePath: string = 'config/DB';

            // @ts-ignore
            path.resolve.mockReturnValueOnce(rootPath + `${storePath.trim()}.json`);
            // @ts-ignore
            safeStorage.isEncryptionAvailable.mockReturnValue(false);

            await schema.withStore(storePath);

            expect(path.resolve).toHaveBeenCalledWith(rootPath, `${storePath.trim()}.json`);
            expect(fs.readFile).toHaveBeenCalledWith(rootPath + `${storePath.trim()}.json`,
                {encoding: 'utf8', flag: 'r'});
        });

        it('GIVEN an absolute path ' +
            'WHEN calling withStore(\'/etc/passwd\') ' +
            'THEN throw an error, ' +
            'leave internal path and store untouched', async () => {
            // @ts-ignore
            path.resolve.mockReturnValueOnce('/etc/passwd.json');
            // @ts-ignore
            safeStorage.isEncryptionAvailable.mockReturnValue(false);

            await expect(schema.withStore('/etc/passwd')).rejects.toThrowError();
            expect(fs.readFile).not.toHaveBeenCalled();
        });
    });

    describe('set(key, value)', () => {
        const storePath: string = rootPath + 'store.json';

        beforeAll(async () => {
            // @ts-ignore
            path.resolve.mockReturnValue(storePath);
        });

        beforeEach(async () => {
            await schema.withStore();
        });

        it('GIVEN default path and store is empty ' +
            'WHEN calling set(\'\', true) ' +
            'THEN throw syntax error', async () => {
            expect.assertions(2);

            await expect(schema.set('', true)).rejects.toThrowError(SyntaxError);
            expect(fs.writeFile).not.toHaveBeenCalled();
        });

        it('GIVEN default path and store is empty ' +
            'WHEN calling set(\'grogu..age\', 42) ' +
            'THEN throw syntax error', async () => {
            expect.assertions(2);

            await expect(schema.set('grogu..age', 42)).rejects.toThrowError(SyntaxError);
            expect(fs.writeFile).not.toHaveBeenCalled();
        });

        it('GIVEN default path and store is empty ' +
            'WHEN calling set(\'simple-key\', true) ' +
            'THEN set key / value and update file', async () => {
            const data: string = JSON.stringify({'simple-key': true});

            await schema.set('simple-key', true);

            expect(fs.writeFile).toHaveBeenCalledWith(storePath, data, {encoding: 'utf8', flag: 'w'});
        });

        it('GIVEN default path and store is empty ' +
            'WHEN calling set(\'grogu.age\', 42) ' +
            'THEN create traversed keys with value and update file', async () => {
            const data: string = JSON.stringify({grogu: {age: 42}});

            await schema.set('grogu.age', 42);

            expect(fs.writeFile).toHaveBeenCalledWith(storePath, data, {encoding: 'utf8', flag: 'w'});
        });

        it('GIVEN default path and store has key \'simple-key\' ' +
            'WHEN calling set(\'simple-key\', {}) ' +
            'THEN update key with new value and update file', async () => {
            const data: string = JSON.stringify({'simple-key': {}});
            await schema.set('simple-key', true);

            await schema.set('simple-key', {});

            expect(fs.writeFile).toHaveBeenCalledWith(storePath, data, {encoding: 'utf8', flag: 'w'});
        });

        it('GIVEN default path and store has key \'grogu: {age: 42}\' ' +
            'WHEN calling set(\'grogu.age\', 1337) ' +
            'THEN update key with new value and update file', async () => {
            const data: string = JSON.stringify({grogu: {age: 1337}});
            await schema.set('grogu.age', 42);

            await schema.set('grogu.age', 1337);

            expect(fs.writeFile).toHaveBeenCalledWith(storePath, data, {encoding: 'utf8', flag: 'w'});
        });

        it('GIVEN default path and store has key \'grogu: {age: 42}\' ' +
            'WHEN calling set(\'grogu.location\', {lat: 37.7989027, long: -122.4507262}) ' +
            'THEN add key with new value and update file', async () => {
            const data: string = JSON.stringify({grogu: {age: 42, location: {lat: 37.7989027, long: -122.4507262}}});
            await schema.set('grogu.age', 42);

            await schema.set('grogu.location', {lat: 37.7989027, long: -122.4507262});

            expect(fs.writeFile).toHaveBeenCalledWith(storePath, data, {encoding: 'utf8', flag: 'w'});
        });
    });

    describe('has(key)', () => {
        const storePath: string = rootPath + 'store.json';

        beforeAll(async () => {
            // @ts-ignore
            path.resolve.mockReturnValue(storePath);
        });

        beforeEach(async () => {
            await schema.withStore();
            // @ts-ignore
            fs.readFile.mockClear();
        });

        it('GIVEN default path and store is empty ' +
            'WHEN calling has(\'\') ' +
            'THEN throw syntax error', async () => {
            await expect(schema.has('')).rejects.toThrowError(SyntaxError);
            expect(fs.readFile).not.toHaveBeenCalled();
        });

        it('GIVEN default path and store is empty ' +
            'WHEN calling has(\'grogu..age\') ' +
            'THEN throw syntax error', async () => {
            await expect(schema.has('grogu..age')).rejects.toThrowError(SyntaxError);
            expect(fs.readFile).not.toHaveBeenCalled();
        });

        it('GIVEN default path and store is empty ' +
            'WHEN calling has(\'grogu\') ' +
            'THEN return false', async () => {
            const result: boolean = await schema.has('grogu');

            expect(result).toBeFalsy();
            expect(fs.readFile).not.toHaveBeenCalled();
        });

        it('GIVEN default path and store is empty ' +
            'WHEN calling has(\'grogu.age\') ' +
            'THEN return false', async () => {
            const result: boolean = await schema.has('grogu.age');

            expect(result).toBeFalsy();
            expect(fs.readFile).not.toHaveBeenCalled();
        });

        it('GIVEN default path and store has key \'grogu: {age: 42}\' ' +
            'WHEN calling has(\'grogu\') ' +
            'THEN return true', async () => {
            await schema.set('grogu', {age: 42});

            const result: boolean = await schema.has('grogu');

            expect(result).toBeTruthy();
            expect(fs.readFile).not.toHaveBeenCalled();
        });

        it('GIVEN default path and store has key \'grogu: {age: 42}\' ' +
            'WHEN calling has(\'grogu.age\') ' +
            'THEN return true', async () => {
            await schema.set('grogu', {age: 42});

            const result: boolean = await schema.has('grogu.age');

            expect(result).toBeTruthy();
            expect(fs.readFile).not.toHaveBeenCalled();
        });

        it('GIVEN default path and store has key \'grogu: {age: 42}\' ' +
            'WHEN calling has(\'grogu.location\') ' +
            'THEN return false', async () => {
            await schema.set('grogu', {age: 42});

            const result: boolean = await schema.has('grogu.location');

            expect(result).toBeFalsy();
            expect(fs.readFile).not.toHaveBeenCalled();
        });
    });

    describe('get(key)', () => {
        const storePath: string = rootPath + 'store.json';

        beforeAll(async () => {
            // @ts-ignore
            path.resolve.mockReturnValue(storePath);
        });

        beforeEach(async () => {
            await schema.withStore();
            // @ts-ignore
            fs.readFile.mockClear();
        });

        it('GIVEN default path and store is empty ' +
            'WHEN calling get(\'\') ' +
            'THEN throw syntax error', async () => {
            await expect(schema.get('')).rejects.toThrowError(SyntaxError);
            expect(fs.readFile).not.toHaveBeenCalled();
        });

        it('GIVEN default path and store is empty ' +
            'WHEN calling get(\'grogu..age\') ' +
            'THEN throw syntax error', async () => {
            await expect(schema.get('grogu..age')).rejects.toThrowError(SyntaxError);
            expect(fs.readFile).not.toHaveBeenCalled();
        });

        it('GIVEN default path and store is empty ' +
            'WHEN calling get(\'grogu\') ' +
            'THEN return undefined', async () => {
            const result: any | undefined = await schema.get('grogu');

            expect(result).toBeUndefined();
            expect(fs.readFile).not.toHaveBeenCalled();
        });

        it('GIVEN default path and store is empty ' +
            'WHEN calling get(\'grogu.age\') ' +
            'THEN return undefined', async () => {
            const result: any | undefined = await schema.get('grogu.age');

            expect(result).toBeUndefined();
            expect(fs.readFile).not.toHaveBeenCalled();
        });

        it('GIVEN default path and store has key \'grogu: {age: 42}\' ' +
            'WHEN calling get(\'grogu\') ' +
            'THEN return object as-this', async () => {
            await schema.set('grogu.age', 42);

            const result: any | undefined = await schema.get('grogu');

            expect(result).toBeDefined();
            expect(result.age).toEqual(42);
            expect(fs.readFile).not.toHaveBeenCalled();
        });

        it('GIVEN default path and store has key \'grogu: {age: 42, message: \'May the force be with you\'}\' ' +
            'WHEN calling get(\'grogu\') ' +
            'THEN return object as-this', async () => {
            await schema.set('grogu', {age: 42, message: 'May the force be with you'});

            const result: any | undefined = await schema.get('grogu.message');

            expect(result).toEqual('May the force be with you');
            expect(fs.readFile).not.toHaveBeenCalled();
        });
    });

    describe('delete(key)', () => {
        const storePath: string = rootPath + 'store.json';

        beforeAll(async () => {
            // @ts-ignore
            path.resolve.mockReturnValue(storePath);
        });

        beforeEach(async () => {
            await schema.withStore();
            // @ts-ignore
            fs.readFile.mockClear();
        });

        it('GIVEN default path and store is empty ' +
            'WHEN calling delete(\'\') ' +
            'THEN throw syntax error', async () => {
            await expect(schema.delete('')).rejects.toThrowError(SyntaxError);
            expect(fs.readFile).not.toHaveBeenCalled();
        });

        it('GIVEN default path and store is empty ' +
            'WHEN calling delete(\'grogu..age\') ' +
            'THEN throw syntax error', async () => {
            await expect(schema.delete('grogu..age')).rejects.toThrowError(SyntaxError);
            expect(fs.readFile).not.toHaveBeenCalled();
        });

        it('GIVEN default path and store has key \'grogu: {age: 42, message: \'May the force be with you\'}\' ' +
            'WHEN calling delete(\'ahsoka\') ' +
            'THEN do nothing', async () => {
            await schema.set('grogu', {age: 42, message: 'May the force be with you'});
            // @ts-ignore
            fs.writeFile.mockClear();

            await expect(schema.delete('ahsoka')).resolves.toBeUndefined();
            expect(fs.readFile).not.toHaveBeenCalled();
            expect(fs.writeFile).not.toHaveBeenCalled();
        });

        it('GIVEN default path and store has key \'grogu: {age: 42, message: \'May the force be with you\'}\' ' +
            'WHEN calling delete(\'grogu.age\') ' +
            'THEN remove key and update file', async () => {
            const data: string = JSON.stringify({grogu: {message: 'May the force be with you'}});

            await schema.set('grogu', {age: 42, message: 'May the force be with you'});
            // @ts-ignore
            fs.writeFile.mockClear();

            await expect(schema.delete('grogu.age')).resolves.toBeUndefined();
            expect(fs.readFile).not.toHaveBeenCalled();
            expect(fs.writeFile).toHaveBeenCalledWith(storePath, data, {encoding: 'utf8', flag: 'w'});
        });

        it('GIVEN default path and store has key \'grogu: {message: \'May the force be with you\'}\' ' +
            'WHEN calling delete(\'grogu.message\') ' +
            'THEN remove key and update file', async () => {
            const data: string = JSON.stringify({grogu: {}});

            await schema.set('grogu', {message: 'May the force be with you'});
            // @ts-ignore
            fs.writeFile.mockClear();

            await expect(schema.delete('grogu.message')).resolves.toBeUndefined();
            expect(fs.readFile).not.toHaveBeenCalled();
            expect(fs.writeFile).toHaveBeenCalledWith(storePath, data, {encoding: 'utf8', flag: 'w'});
        });

        it('GIVEN default path and store has key \'grogu: {}\' ' +
            'WHEN calling delete(\'grogu\') ' +
            'THEN remove key and update file', async () => {
            const data: string = JSON.stringify({});

            await schema.set('grogu', {});
            // @ts-ignore
            fs.writeFile.mockClear();

            await expect(schema.delete('grogu')).resolves.toBeUndefined();
            expect(fs.readFile).not.toHaveBeenCalled();
            expect(fs.writeFile).toHaveBeenCalledWith(storePath, data, {encoding: 'utf8', flag: 'w'});
        });
    });

    // TODO: test encrypt / decrypt usage when using store with encryption enabled.
});
