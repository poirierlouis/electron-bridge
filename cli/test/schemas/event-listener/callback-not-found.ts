import {EventListener, Schema} from "electron-bridge-cli";

@Schema(true)
export class CallbackNotFound {

    @EventListener('wrong')
    public onWrong(listener: string): void {

    }

}
