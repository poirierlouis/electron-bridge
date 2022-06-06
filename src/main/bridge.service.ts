import {Bridge} from './bridge';

export class BridgeService {

    private bridges: Bridge[];

    constructor() {
        this.bridges = [];
    }

    public add(bridge: Bridge): this {
        this.bridges.push(bridge);
        return this;
    }

    public registerAll(): void {
        this.bridges.forEach(bridge => bridge.register());
    }

    public releaseAll(): void {
        this.bridges.forEach(bridge => bridge.release());
    }

}
