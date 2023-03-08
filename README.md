# electron-bridge
[![npm version](https://img.shields.io/npm/v/@lpfreelance/electron-bridge)](https://www.npmjs.com/package/@lpfreelance/electron-bridge)

This library provides common main process modules (bridges) to be used from a renderer process in your Electron 
application [(cf Process Model)](https://www.electronjs.org/docs/latest/tutorial/process-model).

This package follows Electron' recommendations to provides you a reusable structured pattern while working in the safest
 environment possible.

Therefore, `electron-bridge` use [Inter-Process Communication](https://www.electronjs.org/docs/latest/api/ipc-main/) through 
[context isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation/) and 
[context bridge](https://www.electronjs.org/docs/latest/tutorial/context-isolation#security-considerations) 
compatible with a [sandbox](https://www.electronjs.org/docs/latest/tutorial/sandbox) environment.



## Repository
This is a monorepo containing two packages:

```
electron-bridge
├── demo/         # a demo to quickly test common modules.
├── demo-forge/   # a demo to show usage with `electron-forge`.
├── cli/          # electron-bridge-cli package to generate schemas.
├── schemas/      # schemas of the Electron's main process modules to generate and expose.
└── src/          # source files generated from schemas.
```



## Install
```shell script
$ npm install --save @lpfreelance/electron-bridge
```



## Naming convention
Here is a brief description of the names used, so that we are on the same page:

|               Path | File                   | Symbol            | Description                             |
|-------------------:|:-----------------------|-------------------|-----------------------------------------|
|     ./bridge/main/ | my-something.bridge.ts | MySomethingBridge | Class used in the main process.         |
|  ./bridge/preload/ | my-something.module.ts | MySomethingModule | Object used in the preload script.      |
| ./bridge/renderer/ | my-something.api.ts    | MySomethingApi    | Interface used in the renderer process. |
|                    |                        |                   |                                         |
| ./bridge/renderer/ | renderer.ts            | Window            | Augment Window with bridge's api.       |

With this example, you must expect IPC channels to be named `eb.mySomething.<functionName>`.

Finally `common bridges` means exposed Electron's main features (e.g. `nativeTheme`, `powerMonitor`, etc.). It also 
contains homebrew bridges for the benefit of all developers.



## Bridges
This table shows you currently implemented bridges:

### 1. Electron
|           Bridge | Description                                                                       |
|-----------------:|-----------------------------------------------------------------------------------|
|      autoUpdater | [cf Documentation](https://www.electronjs.org/docs/latest/api/auto-updater)       |
|           dialog | [cf Documentation](https://www.electronjs.org/docs/latest/api/dialog)             |
|      nativeTheme | [cf Documentation](https://www.electronjs.org/docs/latest/api/native-theme)       |
|     powerMonitor | [cf Documentation](https://www.electronjs.org/docs/latest/api/power-monitor)      |
| powerSaveBlocker | [cf Documentation](https://www.electronjs.org/docs/latest/api/power-save-blocker) |
|      safeStorage | [cf Documentation](https://www.electronjs.org/docs/latest/api/safe-storage)       |

### 2. Homebrew
|     Bridge | Description                                                                           |
|-----------:|---------------------------------------------------------------------------------------|
| fileSystem | Very simple wrapper for Node.js [file system](https://nodejs.org/api/fs.html) module. |
|       path | Wrapper for Node.js [path](https://nodejs.org/api/path.html) module.                  |
|      store | JSON key/value storage solution using `safeStorage` to encrypt / decrypt data.        |

You can see usage of each bridge in [demo/](https://github.com/poirierlouis/electron-bridge/tree/master/demo).



## Usage

### 1. Main process side
In your electron entry-point:

1. Instantiate a BridgeService.
2. Add bridges you which to use on the renderer process side.
3. Register all modules to actually listen to IPC handlers.

> electron.dev.ts
```typescript
import {app, BrowserWindow} from 'electron';
import {BridgeService, DialogBridge} from '@lpfreelance/electron-bridge/main';

let win: BrowserWindow;
let bridgeService: BridgeService;

app.enableSandbox();

const createWindow = () => {
  win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nativeWindowOpen: true,
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      // ...
    }
  });

  win.loadFile('index.html');

  // Create bridge service.
  bridgeService = new BridgeService();

  // Append bridges that you need and register all IPC handlers.
  bridgeService.add(new DialogBridge())
               .registerAll();

  win.on('closed', () => {
    // Release bridges resources
    bridgeService.releaseAll();

    win = null;
    bridgeService = null;
  });
};
```

You can also add your own bridge ([see Custom bridge](#custom-bridge)).
Now that we have registered IPC handlers, we must declare a preload script.

### 2. Preload script
Using `context bridge`, it will allow us to expose bridges on the renderer process.
With `PreloadService`, we can expose only what we want to use:

> electron.preload.ts
```typescript
import {PreloadService} from '@lpfreelance/electron-bridge/preload';

const preloadService = new PreloadService();

preloadService.add('dialog')
              .expose();
```

Here you add the modules matching the bridges you added in `electron.dev.ts` file.
You just need to use the `camelCase` name of the bridge, like in Electron documentation (e.g. `nativeTheme`, `powerMonitor`,
 etc.).

You can also add your own module. This is further explained below ([see Create a module](#2-create-a-module)).

You must call `expose()` in order to expose your modules using `context bridge`.

Now Electron needs to know that this script must be preloaded. When creating a BrowserWindow, we just need to set the 
preload path of our script like below:

> electron.dev.ts
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
In your renderer process, aka your application. You can now access exposed bridges like this:

> index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>electron-bridge-test</title>
</head>
<body>
<script>
window.dialog.showOpenDialog({title: 'My Awesome Native Dialog', properties: ['openDirectory']})
      .then(result => {
        if (result.canceled || result.filePaths.length !== 1) {
          console.error(`<i-need-a-file-and-only-one-file />`);
          return;
        }
        console.info(`<directory path="${result.filePaths[0]}" />`);
      });
</script>
</body>
</html>
```

As you can see, you can simply use the native `dialog` module from your renderer process.
You'll notice that it reflects the same API exposed by Electron. This way, you can directly look at Electron's 
documentation.

### 4. Test it
You can now execute the following command to run electron:

```shell script
$ tsc electron.dev.ts electron.preload.ts && electron electron.dev.js
```

### 5. Using [electron-forge](https://www.electronforge.io/)

You can use this plugin and `electron-bridge-cli` with electron-forge.

After creating a project with electron-forge, you must remove the following rules in `webpack.rules.ts`:
```typescript
  {
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
  },
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
```

When importing external modules which are natives (Node.js only), you may need to declare them as external in 
`webpack.main.config.ts`:
```typescript
  externals: {
    "<package-name>": "commonjs2 <package-name>",
  },
```

See more in [demo-forge/](demo-forge) which demonstrate the use of the module 
[Clipboard](https://www.electronjs.org/docs/latest/api/clipboard) and the package 
[fastnoisejs](https://www.npmjs.com/package/fastnoisejs) using schemas.



## Custom bridge
You will now learn how to write your own `bridge` which is composed of three files.

You **should** first take a look to understand how things works together.
But ultimately you'll want to use a `Schema` thanks to [electron-bridge-cli](https://github.com/poirierlouis/electron-bridge/tree/master/cli) in `cli/`.

### 1. Create a bridge
> Side: main process

You must implement a Bridge interface in order to register it in the main process:

> src/bridge/main/app.bridge.ts
```typescript
import {App, ipcMain} from 'electron';
import {Bridge} from '@lpfreelance/electron-bridge/main';

export class AppBridge implements Bridge {

    constructor(private app: App) {
        
    }

    public register(): void {
        ipcMain.handle('eb.app.getVersion', (event: any) => {
            return this.app.getVersion();
        });
        ipcMain.handle('eb.app.getName', (event: any) => {
            return this.app.getName();
        });
        ipcMain.handle('eb.app.getPath', (event: any, path: string) => {
            return this.app.getPath(path);
        });
        // allocate resources you'll need.
    }

    public release(): void {
        ipcMain.removeHandler('eb.app.getVersion');
        ipcMain.removeHandler('eb.app.getName');
        ipcMain.removeHandler('eb.app.getPath');
        // release resources you no longer need.
    }

}
```

### 2. Create a module
> Side: preload script

Then, you must write your module using BridgeModule interface:

> src/bridge/preload/app.module.ts
```typescript
import {ipcRenderer} from 'electron';
import {BridgeModule} from '@lpfreelance/electron-bridge/preload';

export const AppModule: BridgeModule = {
    name: 'app',
    readonly: true,
    api: {
        getVersion: async () => {
            return await ipcRenderer.invoke('eb.app.getVersion');
        },
        getName: async () => {
            return await ipcRenderer.invoke('eb.app.getName');
        },
        getPath: async (path: string) => {
            return await ipcRenderer.invoke('eb.app.getPath', path);
        }
    }
};
```

You can now import and add your custom module in the preload script:

> src/electron.preload.ts
```typescript
import {PreloadService} from '@lpfreelance/electron-bridge/preload';
import {AppModule} from './bridge/module/app.module.ts';

const preloadService = new PreloadService();

preloadService.add('dialog')
              .add(AppModule)
              .expose();
```

### 3. Create an api interface
> Side: your beloved IDE

Let's write an exported interface for our bridge:

> src/bridge/renderer/app.api.ts
```typescript
export interface AppApi {
    
    getName(): Promise<string>;
    getVersion(): Promise<number>;
    getPath(path: string): Promise<string>;

}
```

And augment the Window interface:

> src/bridge/renderer/renderer.ts
```typescript
import {AppApi} from './app.api';

declare global {
    interface Window {
        app: AppApi;
    }
}
```

### 4. Build it
Use your preferred bundler to bundle your application and target each Electron's process. You can find an example using
[webpack](https://webpack.js.org/) with this repository configuration file: `./webpack.dev.js`.
You should edit this configuration to match your project.

You can then bundle with:
```shell script
$ webpack --config webpack.dev.js
```

### 5. Test it
`Side: renderer process`

We can now use our custom module:
> index.html
```html
<!-- ... -->
<script>
  // ...
  Promise.all([
    window.app.getName(),
    window.app.getVersion(),
    window.app.getPath('userData')
  ]).then(([name, version, path]) => {
    console.log(`<app name="${name}" version="${version}" user-data="${path}" />`);
  });
</script>
<!-- ... -->
```



## Security
This library provides a pattern to quickly access main process features. You are still responsible regarding features 
you expose to the renderer process ([cf Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)).

You can quickly implement a logic in your application using the `fileSystem` module and test it. But at the end, you 
should create your own custom module and always check for bad behaviors.

You can see an example with the `store` bridge. When `StoreBridge` is created, you give an absolute path (parent) 
where to store JSON files. You can then create multiple JSON files in this directory using `store.withStore('my/path/db')`.
Without safety checks, calling `store.withStore('/root/my-store')` would allow **any users** to create a file outside 
the given parent `path`.

In this implementation, attempting to resolve the store's path outside the given parent path will throw an error.



## Schemas
A schema allows you to write a single file to describe a bridge between the main process and the renderer process.
You can then use `electron-bridge-cli` in `cli/` to generate a bridge file, a module file and an api file.

Actually, this package uses `schemas/` with [electron-bridge-cli](https://github.com/poirierlouis/electron-bridge/tree/master/cli)
to generate all files under `src/`.

> This is the way.



## Contributing

Feel free to contribute by creating an issue / submitting a pull-request.

If you wish to propose a new bridge, create an issue to discuss it, or just submit a PR if you already wrote it.
Please remember that one bridge = one schema.
