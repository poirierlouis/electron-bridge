import {PreloadService} from "electron-bridge/preload";

const preload = new PreloadService();

preload.add('dialog')
       .add('nativeTheme')
       .add('powerMonitor')
       .add('store')
       .expose();
