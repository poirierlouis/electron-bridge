import {EventListener, Schema} from '@lpfreelance/electron-bridge-cli';

@Schema(true)
export class ParameterNotFound {

    @EventListener('not-found')
    public onNotFound(): void {

    }

}
