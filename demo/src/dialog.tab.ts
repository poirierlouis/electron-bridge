import {AbstractTab} from "./abstract.tab";
import "@lpfreelance/electron-bridge/renderer";

export class DialogTab extends AbstractTab {

    private $openDialogButton: HTMLButtonElement;
    private $dialogResult: HTMLInputElement;

    constructor() {
        super('dialog');
    }

    public load(): void {
        this.$openDialogButton = document.querySelector('#open-dialog');
        this.$dialogResult = document.querySelector('#path');

        this.$openDialogButton.addEventListener('click', () => {
            window.dialog.showOpenDialog({
                title: 'My Awesome Dialog',
                properties: ['openFile'],
                filters: [
                    {name: 'Awesome File', extensions: ['txt', 'json']}
                ]
            }).then(result => {
                if (result.canceled || result.filePaths.length !== 1) {
                    console.warn(`<i-need-an-awesome-file />`);
                    return;
                }
                this.$dialogResult.value = result.filePaths[0];
            }).catch(error => {

            });
        });
    }

    public onHide(): void {

    }

    public onShow(): void {

    }

}
