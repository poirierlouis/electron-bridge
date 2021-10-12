import { DialogApi } from "./dialog.api";
import { FileSystemApi } from "./file-system.api";
import { NativeThemeApi } from "./native-theme.api";
import { PathApi } from "./path.api";
import { PowerSaveBlockerApi } from "./power-save-blocker.api";
import { SafeStorageApi } from "./safe-storage.api";
import { StoreApi } from "./store.api";

declare global
{
    interface Window
    {
        dialog: DialogApi;
        fileSystem: FileSystemApi;
        nativeTheme: NativeThemeApi;
        path: PathApi;
        powerSaveBlocker: PowerSaveBlockerApi;
        safeStorage: SafeStorageApi;
        store: StoreApi;
    }
}