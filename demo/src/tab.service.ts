import {Tab} from "./tab";

export class TabService {

    private readonly tabs: Tab[];

    private tab: Tab | null;

    constructor() {
        this.tabs = [];
        this.tab = null;
    }

    public load(tabs: Tab[], selectedTab?: string): void {
        this.tabs.push(...tabs);
        this.tabs.forEach(tab => {
            tab.load();
            this.setTabVisibility(tab, false);
        });
        this.tab = this.tabs.find(tab => tab.name === selectedTab) || null;
        this.setTabVisibility(this.tab, true);
    }

    public listen(): void {
        this.tabs.forEach(tab => {
            const $button: HTMLButtonElement | undefined = document.querySelector(`.tabs button[data-tab="${tab.name}"]`);

            if (!$button) {
                return;
            }
            $button.onclick = () => this.onSelectTab(tab);
        });
    }

    private onSelectTab(tab: Tab): void {
        const $tab: HTMLElement | undefined = document.querySelector(`#${tab.name}.tab`);

        if (!$tab) {
            return;
        }
        this.setTabVisibility(this.tab, false);
        this.tab = tab;
        this.setTabVisibility(this.tab, true);
    }

    private setTabVisibility(tab: Tab, isVisible: boolean): void {
        const $button: HTMLButtonElement | undefined = document.querySelector(`button[data-tab="${tab.name}"]`);
        const $tab: HTMLElement | undefined = document.querySelector(`#${tab.name}.tab`);

        if (!$button || !$tab) {
            return;
        }
        if (isVisible) {
            $button.classList.add('active');
            $tab.classList.remove('hide');
        } else {
            $button.classList.remove('active');
            $tab.classList.add('hide');
        }
    }

}
