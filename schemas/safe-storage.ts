import {safeStorage} from "electron";
import {Schema} from "electron-bridge-cli";

/**
 * Allows access to simple encryption and decryption of strings for storage on the local machine.
 */
@Schema(true)
export class PowerSaveBlocker {

    /**
     * On Linux, returns true if the secret key is available. On MacOS, returns true if Keychain is available.
     * On Windows, returns true with no other preconditions.
     *
     * @returns Whether encryption is available.
     */
    public async isEncryptionAvailable(): Promise<boolean> {
        return safeStorage.isEncryptionAvailable();
    }

    /**
     * This function will throw an error if encryption fails.
     *
     * @param plainText
     * @returns An array of bytes representing the encrypted string.
     */
    public async encryptString(plainText: string): Promise<ArrayBuffer> {
        return safeStorage.encryptString(plainText);
    }

    /**
     * This function will throw an error if decryption fails.
     *
     * @param encrypted
     * @returns the decrypted string. Decrypts the encrypted buffer obtained with safeStorage.encryptString back into a string.
     */
    public async decryptString(encrypted: ArrayBuffer): Promise<string> {
        return safeStorage.decryptString(new Buffer(encrypted));
    }

}
