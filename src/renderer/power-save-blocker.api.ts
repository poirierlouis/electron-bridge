/**
 * Block the system from entering low-power (sleep) mode.
 */
export interface PowerSaveBlockerApi {
    start(type: 'prevent-app-suspension' | 'prevent-display-sleep'): Promise<number>;

    stop(id: number): Promise<void>;

    isStarted(id: number): Promise<boolean>;
}
