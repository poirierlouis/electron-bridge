# electron-bridge

electron-bridge provides access to main process modules through renderer process.
Modules are available with safe [context isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation/) 
using [Inter-Process Communication]() and [Context Bridge](https://www.electronjs.org/docs/latest/tutorial/context-isolation#security-considerations)
 within a [sandbox](https://www.electronjs.org/docs/latest/tutorial/sandbox) environment.


You can use exposed features as-this like described below.

Or you can use one of the following libraries to easily access exposed features with your framework of choice:

| Framework | Library          |
|-----------|------------------|
|   Angular | @lp/ngx-electron |
|     React |                  |
|       Vue |                  |

## Install
```shell script
$ npm install --save-dev @lp/electron-bridge
```

## How to use

### 1. Main process side
In your electron entry-point:

1. Instanciate a ProxyService.
2. Add modules you which to use on the renderer process side.
3. Register all modules to actually listen to IPC handlers.

`electron.dev.ts:`
```typescript
import {app, BrowserWindow} from 'electron';
import {ProxyService, DialogProxy, NativeThemeProxy, FileSystemProxy, StoreProxy} from '@lp/electron-bridge';

let win: any;
let proxyService: any;

const createWindow = () => {
  win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      sandbox: true
      // ...
    }
  });

  win.loadFile('index.html');

  // Create proxy service.
  proxyService = new ProxyService();

  // Append proxy modules that you need and want to expose.
  proxyService.add(new DialogProxy());
  proxyService.add(new NativeThemeProxy(win));
  proxyService.add(new FileSystemProxy());
  proxyService.add(new StoreProxy(app));

  // Register IPC handlers for each module.
  proxyService.registerAll();

  win.on('closed', () => {
    // Release proxy resources
    proxyService.releaseAll();

    win = null;
    proxyService = null;
  });
};

// ...
```

You can also add your own proxy (see Custom module).
Now that we have registered IPC handlers, we must declare a preload script.

### 2. Preload script
Using Context Bridge, it will allow us to expose modules on the renderer process.
That way, we can expose only what we use:

`electron.preload.ts:`
```typescript
import {modules as defaultModules, expose} from '@lp/electron-bridge';

const modules = defaultModules;

expose(...modules);
```

You must call `expose()` with modules. It will expose for you modules' API using ContextBridge.
Here you can choose modules you want to expose or not. You can also add your own module (see Custom module).

Now Electron needs to know that this script must be preloaded. When creating BrowserWindow, we just need to set the preload
path of our script like below.

`electron.dev.ts`:
```typescript
import * as path from 'path';

// ...
win = new BrowserWindow({
    // ...
    webPreferences: {
        // ...
        preload: path.join(__dirname, 'electron.preload.js')
    }
});
```
### 3. Renderer process side
This example use `dialog` module to open a native dialog picker.

`index.html:`
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
    <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">
    <meta http-equiv="X-Content-Security-Policy" content="default-src 'self'; script-src 'self'">
    <title>Hello World!</title>
  </head>
  <body>
    <h1>Hello World!</h1>
    <script>
        window.dialog.showOpenDialog({title: 'My Awesome Native Dialog', properties: ['openDirectory']})
                     .then(result => {
                        if (result.canceled || result.filePaths.length !== 1) {
                            console.error(`<i-need-a-file />`);
                            return;
                        }
                        console.info(`<file-picker path="${result.filePaths[0]}" />`);
                     });
    </script>
  </body>
</html>
```

You'll notice that it reflects the same API exposed by Electron.
That way, you can directly look at Electron's documentation.


### 4. Run it

You can now execute following command to run electron:
```shell script
$ tsc electron.dev.ts electron.preload.ts && electron electron.dev.js
```

## Custom module

### I - Create a proxy
You must implement AbstractProxy interface in order to register your proxy:

`app.proxy.ts:`
```typescript
import {App, ipcMain} from 'electron';
import {AbstractProxy} from '@lp/electron-bridge';

export class AppProxy implements AbstractProxy {

    constructor(private app: App) {
        
    }

    public register(): void {
        ipcMain.handle('ep.app.getVersion', async (event: any) => {
            return this.app.getVersion();
        });
        ipcMain.handle('ep.app.getName', async (event: any) => {
            return this.app.getName();
        });
        ipcMain.handle('ep.app.setName', async (event: any, name: string) => {
            this.app.setName(name);
        });
    }

    public release(): void {
        // release resources you no longer need.
    }

}
```

### II - Create bridge API

Write your module using ProxyModule interface:

`custom.preload.ts:`
```typescript
import {ipcRenderer} from 'electron';
import {ProxyModule} from '@lp/electron-bridge';

export const AppModule: ProxyModule = {
    name: 'app',
    api: {
        getVersion: async () => {
            return await ipcRenderer.invoke('ep.app.getVersion');
        },
        getName: async () => {
            return await ipcRenderer.invoke('ep.app.getName');
        },
        setName: async (name: string) => {
            return await ipcRenderer.invoke('ep.app.setName', name);
        }
    }
};
```

Include your modules in preload script:

`electron.preload.ts:`
```typescript
import {modules as defaultModules, expose} from '@lp/electron-bridge';
import {AppModule} from 'custom.preload.ts';

const modules = defaultModules;

expose(...modules, AppModule);
```

We can now use our custom module:
`index.html:`
```html
<!-- ... -->
<script>
    console.log(`<my-app name="${window.app.getName()}" version="${window.app.getVersion()}" />`);
</script>
<!-- ... -->
```




https://www.electronjs.org/docs/latest/tutorial/context-isolation#security-considerations
