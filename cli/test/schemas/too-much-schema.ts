import {Schema} from "electron-bridge-cli";

@Schema(true)
export class TooMuchSchema {

    constructor() {

    }

    public async firstOne(wrong: string): Promise<void> {
        // nothing here!
    }

}

@Schema(false)
export class TooMuchSchemaBis {

    constructor() {

    }

    public async secondOne(wrong: string): Promise<void> {
        // nothing here!
    }

}
