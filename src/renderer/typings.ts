import {DialogApi} from "./dialog.api";
import {NativeThemeApi} from "./native-theme.api";
import {PowerMonitorApi} from "./power-monitor.api";
import {StoreApi} from "./store.api";

declare global {

    interface Window {

        dialog: DialogApi;
        nativeTheme: NativeThemeApi;
        powerMonitor: PowerMonitorApi;
        store: StoreApi;

    }

}
