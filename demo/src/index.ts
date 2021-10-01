import {Tab} from "./tab";
import {DialogTab} from "./dialog.tab";
import {TabService} from "./tab.service";
import {NativeThemeTab} from "./native-theme.tab";
import {PowerMonitorTab} from "./power-monitor.tab";
import {StoreTab} from "./store.tab";

const tabService: TabService = new TabService();

const tabs: Tab[] = [
    new DialogTab(),
    new NativeThemeTab(),
    new PowerMonitorTab(),
    new StoreTab()
];

tabService.load(tabs, 'dialog');
tabService.listen();
