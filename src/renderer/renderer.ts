import { AutoUpdaterApi } from "./auto-updater.api";
import { DialogApi } from "./dialog.api";
import { FileSystemApi } from "./file-system.api";
import { NativeThemeApi } from "./native-theme.api";
import { PathApi } from "./path.api";
import { PowerMonitorApi } from "./power-monitor.api";
import { StoreApi } from "./store.api";

declare global {
    interface Window {
        autoUpdater: AutoUpdaterApi;
        dialog: DialogApi;
        fileSystem: FileSystemApi;
        nativeTheme: NativeThemeApi;
        path: PathApi;
        powerMonitor: PowerMonitorApi;
        store: StoreApi;
    }
}

