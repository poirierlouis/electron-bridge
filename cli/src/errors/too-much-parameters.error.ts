import {AbstractError} from "./abstract.error";

export class TooMuchParametersError extends AbstractError {

    constructor(file: string, name: string) {
        super('too-much-parameters', `<error type="too-much-parameters" file="${file}" message="Found too many parameters in method '${name}', provide only one callback when using @EventListener." />`);
    }

}
