/**
 * Monitor power state changes.
 */
export interface PowerMonitorApi {

    getSystemIdleState(idleThreshold: number): Promise<'active' | 'idle' | 'locked' | 'unknown'>;
    getSystemIdleTime(): Promise<number>;
    isOnBatteryPower(): Promise<boolean>;

}
