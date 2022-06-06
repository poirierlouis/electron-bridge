import {EventListener, Schema} from '@lpfreelance/electron-bridge-cli';

@Schema(true)
export class TooMuchParameters {

    @EventListener('too-much')
    public onTooMuch(listener: Function, whatToDoWithMe: any): void {

    }

}
