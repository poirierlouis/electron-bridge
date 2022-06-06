import {powerSaveBlocker} from 'electron';
import {Schema} from '@lpfreelance/electron-bridge-cli';

/**
 * Block the system from entering low-power (sleep) mode.
 */
@Schema(true)
export class PowerSaveBlocker {

    public async start(type: 'prevent-app-suspension' | 'prevent-display-sleep'): Promise<number> {
        return powerSaveBlocker.start(type);
    }

    public async stop(id: number): Promise<void> {
        powerSaveBlocker.stop(id);
    }

    public async isStarted(id: number): Promise<boolean> {
        return powerSaveBlocker.isStarted(id);
    }

}
