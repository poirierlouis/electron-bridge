import {EventListener, Schema} from '@lpfreelance/electron-bridge-cli';

@Schema(true)
export class CallbackNotFound {

    @EventListener('wrong')
    public onWrong(listener: string): void {

    }

}
