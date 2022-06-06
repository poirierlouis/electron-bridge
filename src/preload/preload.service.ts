import {contextBridge} from 'electron';
import {BridgeModule} from './bridge.module';
import {DefaultMainModule} from './typings';
import {DialogModule} from './dialog.module';
import {NativeThemeModule} from './native-theme.module';
import {StoreModule} from './store.module';
import {PathModule} from './path.module';
import {PowerMonitorModule} from './power-monitor.module';
import {AutoUpdaterModule} from './auto-updater.module';
import {FileSystemModule} from './file-system.module';

/**
 * Service to add common and custom modules to preload.
 */
export class PreloadService {

    private static readonly commons: BridgeModule[] = [
        AutoUpdaterModule,
        DialogModule,
        FileSystemModule,
        NativeThemeModule,
        PathModule,
        PowerMonitorModule,
        StoreModule
    ];
    private readonly modules: BridgeModule[];

    constructor() {
        this.modules = [];
    }

    /**
     * Add a module to be exposed.
     * @param module name of default module or custom module of yours.
     */
    public add(module: BridgeModule | DefaultMainModule): this {
        let m: BridgeModule | undefined;

        if (typeof module === 'string') {
            m = PreloadService.commons.find(defaultModule => defaultModule.name === module);
            if (!m) {
                console.warn(`<electron-bridge preload="${module} not found!" />`);
                return this;
            }
        } else {
            m = <BridgeModule>module;
        }
        this.modules.push(m);
        return this;
    }

    /**
     * Expose modules using Context Bridge.
     * Access modules in the renderer process using window global variable (e.g window.dialog).
     */
    public expose(): void {
        this.modules.forEach(module => contextBridge.exposeInMainWorld(module.name, module.api));
    }

}
