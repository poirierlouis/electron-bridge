import {BrowserWindow, powerMonitor} from 'electron';
import {PowerMonitor} from './power-monitor';

jest.mock('electron', () => ({
    BrowserWindow: jest.fn().mockImplementation(() => ({
        webContents: {
            send: jest.fn()
        }
    })),
    powerMonitor: {
        on: jest.fn(),
        off: jest.fn(),
        getSystemIdleState: jest.fn(),
        getSystemIdleTime: jest.fn(),
        isOnBatteryPower: jest.fn()
    }
}));

describe(PowerMonitor, () => {
    let schema: PowerMonitor;
    let win: BrowserWindow;

    beforeAll(() => {
        win = new BrowserWindow();
    });

    beforeEach(() => {
        schema = new PowerMonitor(win);
    });

    afterEach(() => {
        // @ts-ignore
        powerMonitor.on.mockClear();
        // @ts-ignore
        powerMonitor.off.mockClear();
    });

    describe('Lifecycle', () => {
        it('GIVEN bridge WHEN calling register() THEN listens on powerMonitor events', () => {
            schema.register();

            expect(powerMonitor.on).toHaveBeenCalledWith('suspend', expect.any(Function));
            expect(powerMonitor.on).toHaveBeenCalledWith('resume', expect.any(Function));
            expect(powerMonitor.on).toHaveBeenCalledWith('on-ac', expect.any(Function));
            expect(powerMonitor.on).toHaveBeenCalledWith('on-battery', expect.any(Function));
            expect(powerMonitor.on).toHaveBeenCalledWith('lock-screen', expect.any(Function));
            expect(powerMonitor.on).toHaveBeenCalledWith('shutdown', expect.any(Function));
            expect(powerMonitor.on).toHaveBeenCalledWith('unlock-screen', expect.any(Function));
            expect(powerMonitor.on).toHaveBeenCalledWith('user-did-become-active', expect.any(Function));
            expect(powerMonitor.on).toHaveBeenCalledWith('user-did-resign-active', expect.any(Function));
        });

        it('GIVEN bridge WHEN calling release() THEN removes listeners on powerMonitor events', () => {
            schema.release();

            expect(powerMonitor.off).toHaveBeenCalledWith('suspend', expect.any(Function));
            expect(powerMonitor.off).toHaveBeenCalledWith('resume', expect.any(Function));
            expect(powerMonitor.off).toHaveBeenCalledWith('on-ac', expect.any(Function));
            expect(powerMonitor.off).toHaveBeenCalledWith('on-battery', expect.any(Function));
            expect(powerMonitor.off).toHaveBeenCalledWith('lock-screen', expect.any(Function));
            expect(powerMonitor.off).toHaveBeenCalledWith('shutdown', expect.any(Function));
            expect(powerMonitor.off).toHaveBeenCalledWith('unlock-screen', expect.any(Function));
            expect(powerMonitor.off).toHaveBeenCalledWith('user-did-become-active', expect.any(Function));
            expect(powerMonitor.off).toHaveBeenCalledWith('user-did-resign-active', expect.any(Function));
        });
    });

    describe('Bridge calls', () => {
        it('should call powerMonitor.getSystemIdleState and return promise', async () => {
            // @ts-ignore
            powerMonitor.getSystemIdleState.mockReturnValue('idle');

            await expect(schema.getSystemIdleState(0)).resolves.toEqual('idle');
            expect(powerMonitor.getSystemIdleState).toHaveBeenCalledWith(0);
        });

        it('should call powerMonitor.getSystemIdleTime and return promise', async () => {
            // @ts-ignore
            powerMonitor.getSystemIdleTime.mockReturnValue(42);

            await expect(schema.getSystemIdleTime()).resolves.toEqual(42);
            expect(powerMonitor.getSystemIdleTime).toHaveBeenCalled();
        });

        it('should call powerMonitor.isOnBatteryPower and return promise', async () => {
            // @ts-ignore
            powerMonitor.isOnBatteryPower.mockReturnValue(true);

            await expect(schema.isOnBatteryPower()).resolves.toEqual(true);
            expect(powerMonitor.isOnBatteryPower).toHaveBeenCalled();
        });
    });

    describe('Events', () => {
        it('should declare listeners', () => {
            expect(schema.onSuspend).toBeDefined();
            expect(schema.onResume).toBeDefined();
            expect(schema.onAc).toBeDefined();
            expect(schema.onBattery).toBeDefined();
            expect(schema.onShutdown).toBeDefined();
            expect(schema.onLockScreen).toBeDefined();
            expect(schema.onUnlockScreen).toBeDefined();
            expect(schema.onUserDidBecomeActive).toBeDefined();
            expect(schema.onUserDidResignActive).toBeDefined();
        });
    });
});
