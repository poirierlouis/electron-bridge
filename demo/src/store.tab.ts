import "@lpfreelance/electron-bridge/renderer";
import {AbstractTab} from "./abstract.tab";

export class StoreTab extends AbstractTab {

    private store: string;

    constructor() {
        super('store');
        this.store = 'store';
    }

    public load(): void {
        const $storeTree = document.querySelector('#store #store-tree');

        window.store.withStore(this.store).then(() => {
            return window.store.get('peoples');
        }).then(peoples => {
            if (!peoples) {
                return;
            }
            $storeTree.innerHTML = StoreTab.beautify(peoples);
        });
    }

    public onHide(): void {

    }

    public onShow(): void {

    }

    private static beautify(data: any): string {
        return JSON.stringify(data);
    }

}
