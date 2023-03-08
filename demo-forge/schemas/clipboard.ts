import {clipboard} from 'electron';
import {Schema} from '@lpfreelance/electron-bridge-cli';

@Schema(true)
export class Clipboard {
    /**
     * Returns text content from clipboard.
     */
    public async read(): Promise<string> {
        return await clipboard.readText();
    }

    /**
     * Sets content of clipboard to text.
     * @param text to set in clipboard.
     */
    public async write(text: string): Promise<void> {
        await clipboard.writeText(text);
    }

    /**
     * Clears content of clipboard.
     */
    public async clear(): Promise<void> {
        await clipboard.clear();
    }
}
