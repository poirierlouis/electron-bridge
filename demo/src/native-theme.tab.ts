import "@lpfreelance/electron-bridge/renderer";
import {AbstractTab} from "./abstract.tab";

export class NativeThemeTab extends AbstractTab {

    constructor() {
        super('native-theme');
    }

    public load(): void {
        const $shouldUseDarkColors: HTMLInputElement = document.querySelector('#shouldUseDarkColors');
        const $shouldUseHighContrastColors: HTMLInputElement = document.querySelector('#shouldUseHighContrastColors');
        const $shouldUseInvertedColorScheme: HTMLInputElement = document.querySelector('#shouldUseInvertedColorScheme');
        const $themeSource: HTMLSelectElement = document.querySelector('#theme-source');

        window.nativeTheme.onUpdated(event => {
            $shouldUseDarkColors.checked = event.shouldUseDarkColors;
            $shouldUseHighContrastColors.checked = event.shouldUseHighContrastColors;
            $shouldUseInvertedColorScheme.checked = event.shouldUseInvertedColorScheme;
        });
        window.nativeTheme.themeSource(<any>$themeSource.value).then(() => {

        });
    }

    public onHide(): void {

    }

    public onShow(): void {

    }

}
