import {EventListener, Schema} from '@lpfreelance/electron-bridge-cli';

@Schema(true)
export class ValidEventListener {

    @EventListener('valid')
    public onValid(listener: Function): void {

    }

    @EventListener("valid-quotes")
    public onValidUsingDoubleQuotes(listener: Function): void {

    }

    @EventListener('valid-arrow')
    public onValidWithArrowFunction(listener: () => void): void {

    }

    @EventListener('valid-arrow-args')
    public onValidWithArrowFunctionWithArguments(listener: (name: string, version: number) => void): void {

    }

}
