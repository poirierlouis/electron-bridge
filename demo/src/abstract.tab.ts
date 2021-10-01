import {Tab} from "./tab";

export abstract class AbstractTab implements Tab {

    readonly name: string;

    protected constructor(name: string) {
        this.name = name;
    }

    public abstract load(): void;
    public abstract onHide(): void;
    public abstract onShow(): void;

}
