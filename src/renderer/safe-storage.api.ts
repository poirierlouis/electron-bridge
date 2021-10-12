
/**
 * Allows access to simple encryption and decryption of strings for storage on the local machine.
 */
export interface PowerSaveBlockerApi {
    /**
     * On Linux, returns true if the secret key is available. On MacOS, returns true if Keychain is available.
     * On Windows, returns true with no other preconditions.
     *
     * @returns Whether encryption is available.
     */
    isEncryptionAvailable(): Promise<boolean>;
    /**
     * This function will throw an error if encryption fails.
     *
     * @param plainText
     * @returns An array of bytes representing the encrypted string.
     */
    encryptString(plainText: string): Promise<ArrayBuffer>;
    /**
     * This function will throw an error if decryption fails.
     *
     * @param encrypted
     * @returns the decrypted string. Decrypts the encrypted buffer obtained with safeStorage.encryptString back into a string.
     */
    decryptString(encrypted: ArrayBuffer): Promise<string>;
}
