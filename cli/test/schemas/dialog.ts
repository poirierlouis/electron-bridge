import {
    dialog,
    MessageBoxOptions,
    MessageBoxReturnValue,
    OpenDialogOptions,
    OpenDialogReturnValue,
    SaveDialogOptions,
    SaveDialogReturnValue
} from "electron";
import {Schema} from 'electron-bridge-cli';

/**
 * Display native system dialogs for opening and saving files, alerting, etc.
 */
@Schema(true)
export class Dialog {

    public async showOpenDialog(options: OpenDialogOptions): Promise<OpenDialogReturnValue> {
        return dialog.showOpenDialog(options);
    }

    public async showSaveDialog(options: SaveDialogOptions): Promise<SaveDialogReturnValue> {
        return dialog.showSaveDialog(options);
    }

    public async showMessageBox(options: MessageBoxOptions): Promise<MessageBoxReturnValue> {
        return dialog.showMessageBox(options);
    }

    public showErrorBox(title: string, content: string): void {
        dialog.showErrorBox(title, content);
    }
}
