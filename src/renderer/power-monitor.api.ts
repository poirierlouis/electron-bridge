/**
 * Monitor power state changes.
 */
export interface PowerMonitorApi {
    getSystemIdleState(idleThreshold: number): Promise<'active' | 'idle' | 'locked' | 'unknown'>;

    getSystemIdleTime(): Promise<number>;

    isOnBatteryPower(): Promise<boolean>;

    onSuspend(listener: Function): void;

    onResume(listener: Function): void;

    onAc(listener: Function): void;

    onBattery(listener: Function): void;

    onShutdown(listener: (event: Event) => void): void;

    onLockScreen(listener: Function): void;

    onUnlockScreen(listener: Function): void;

    onUserDidBecomeActive(listener: Function): void;

    onUserDidResignActive(listener: Function): void;
}
