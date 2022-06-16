import {FileSystem} from './file-system';
import * as fs from 'fs/promises';

jest.mock('fs');
jest.mock('fs/promises');

describe(FileSystem, () => {
    let schema: FileSystem;

    beforeEach(() => {
        schema = new FileSystem();
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

    describe('Bridge calls', () => {
        it('should call fs.readFile and return promise', async () => {
            await schema.readFile('/some/where.json', {encoding: 'utf-8', flag: 'r'});

            expect(fs.readFile).toHaveBeenCalledWith('/some/where.json', {encoding: 'utf-8', flag: 'r'});
        });

        it('should call fs.writeFile and return promise', async () => {
            await schema.writeFile('/some/where.json', 'Hello World!', {encoding: 'utf-8', flag: 'w'});

            expect(fs.writeFile).toHaveBeenCalledWith('/some/where.json', 'Hello World!', {encoding: 'utf-8', flag: 'w'});
        });
    });
});
