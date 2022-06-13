import {powerSaveBlocker} from 'electron';
import {PowerSaveBlocker} from './power-save-blocker';

jest.mock('electron', () => ({
    BrowserWindow: jest.fn().mockImplementation(() => ({
        webContents: {
            send: jest.fn()
        }
    })),
    powerSaveBlocker: {
        start: jest.fn(),
        stop: jest.fn(),
        isStarted: jest.fn()
    }
}));

describe(PowerSaveBlocker, () => {
    let schema: PowerSaveBlocker;

    beforeEach(() => {
        schema = new PowerSaveBlocker();
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
        it('should call powerSaveBlocker.start and return promise', async () => {
            // @ts-ignore
            powerSaveBlocker.start.mockReturnValue(1337);

            await expect(schema.start('prevent-app-suspension')).resolves.toEqual(1337);
            expect(powerSaveBlocker.start).toHaveBeenCalledWith('prevent-app-suspension');
        });

        it('should call powerSaveBlocker.stop and return promise', async () => {
            await expect(schema.stop(1337)).resolves.toBeUndefined();
            expect(powerSaveBlocker.stop).toHaveBeenCalledWith(1337);
        });

        it('should call powerMonitor.isStarted and return promise', async () => {
            // @ts-ignore
            powerSaveBlocker.isStarted.mockReturnValue(true);

            await expect(schema.isStarted(1337)).resolves.toEqual(true);
            expect(powerSaveBlocker.isStarted).toHaveBeenCalledWith(1337);
        });
    });

});
