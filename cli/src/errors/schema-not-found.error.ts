import {AbstractError} from './abstract.error';

export class SchemaNotFoundError extends AbstractError {

    constructor(file: string) {
        super('schema-not-found', `<warning type="schema-not-found" file="${file}" message="Could not find an exported class with @Schema decorator." />`);
    }

}
