export interface Tab {

    readonly name: string;

    load(): void;

    onShow(): void;
    onHide(): void;

}
