import {
    MessageBoxOptions,
    MessageBoxReturnValue,
    OpenDialogOptions,
    OpenDialogReturnValue,
    SaveDialogOptions,
    SaveDialogReturnValue
} from 'electron';

/**
 * Display native system dialogs for opening and saving files, alerting, etc.
 */
export interface DialogApi {
    showOpenDialog(options: OpenDialogOptions): Promise<OpenDialogReturnValue>;

    showSaveDialog(options: SaveDialogOptions): Promise<SaveDialogReturnValue>;

    showMessageBox(options: MessageBoxOptions): Promise<MessageBoxReturnValue>;

    showErrorBox(title: string, content: string): void;
}
