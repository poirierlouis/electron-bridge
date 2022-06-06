import {AbstractError} from './abstract.error';

export class CallbackNotFoundError extends AbstractError {

    constructor(file: string, name: string) {
        super('callback-not-found', `<error type="callback-not-found" file="${file}" message="Parameter type in method '${name}' with @EventListener must be a method signature (e.g. Function, () => void, etc.)." />`);
    }

}
