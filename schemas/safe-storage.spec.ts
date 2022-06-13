import {safeStorage} from 'electron';
import {SafeStorage} from './safe-storage';

jest.mock('electron', () => ({
    BrowserWindow: jest.fn().mockImplementation(() => ({
        webContents: {
            send: jest.fn()
        }
    })),
    safeStorage: {
        isEncryptionAvailable: jest.fn(),
        encryptString: jest.fn(),
        decryptString: jest.fn()
    }
}));

describe(SafeStorage, () => {
    let schema: SafeStorage;

    beforeEach(() => {
        schema = new SafeStorage();
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
        it('should call powerSaveBlocker.isEncryptionAvailable and return promise', async () => {
            // @ts-ignore
            safeStorage.isEncryptionAvailable.mockReturnValue(true);

            await expect(schema.isEncryptionAvailable()).resolves.toEqual(true);
            expect(safeStorage.isEncryptionAvailable).toHaveBeenCalled();
        });

        it('should call safeStorage.encryptString and return promise', async () => {
            const hash: ArrayBuffer = new ArrayBuffer(64);

            // @ts-ignore
            safeStorage.encryptString.mockReturnValue(hash);

            await expect(schema.encryptString('Hello World!')).resolves.toEqual(hash);
            expect(safeStorage.encryptString).toHaveBeenCalledWith('Hello World!');
        });

        it('should call safeStorage.encryptString and return promise', async () => {
            const hash: ArrayBuffer = new ArrayBuffer(64);

            // @ts-ignore
            safeStorage.encryptString.mockReturnValue(hash);

            await expect(schema.encryptString('Hello World!')).resolves.toEqual(hash);
            expect(safeStorage.encryptString).toHaveBeenCalledWith('Hello World!');
        });

        it('should call safeStorage.decryptString and return promise', async () => {
            const hash: ArrayBuffer = new ArrayBuffer(64);

            // @ts-ignore
            safeStorage.decryptString.mockReturnValue('Hello World!');

            await expect(schema.decryptString(hash)).resolves.toEqual('Hello World!');
            expect(safeStorage.decryptString).toHaveBeenCalledWith(Buffer.from(hash));
        });
    });

});
