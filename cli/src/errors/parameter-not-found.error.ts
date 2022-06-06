import {AbstractError} from './abstract.error';

export class ParameterNotFoundError extends AbstractError {

    constructor(file: string, name: string) {
        super('parameter-not-found', `<error type="parameter-not-found" file="${file}" message="Could not find a parameter in method '${name}' with @EventListener. You must provide a callback method signature." />`);
    }

}
