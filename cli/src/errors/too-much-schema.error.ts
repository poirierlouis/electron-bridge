import {AbstractError} from "./abstract.error";
import {ClassDeclaration} from "ts-morph";

export class TooMuchSchemaError extends AbstractError {

    constructor(file: string, cd: ClassDeclaration[]) {
        super('too-much-schema',`<warning type="too-much-schema" file="${file}" schemas="[${cd.map(cd => cd.getName()).join(', ')}]" message="Accept only one schema per file." />`);
    }

}
