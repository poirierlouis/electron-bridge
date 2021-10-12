export class AbstractError implements Error {

    public readonly name: string;
    public readonly message: string;

    constructor(name: string, message: string) {
        this.name = name;
        this.message = message;
    }

}
