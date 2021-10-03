# electron-bridge-cli

`electron-bridge-cli` is a tool to quickly create bridges for [electron-bridge](https://github.com/poirierlouis/electron-bridge).
This is used internally to generate source files in `electron-bridge`.
You can use this command line interface to create your own custom modules.

## Install
```shell script
$ npm install --save-dev electron-bridge-cli
```

## Usage
```shell script
$ eb generate ./bridge.config.json
```

Execute program from current working directory using given configuration file.

## Configuration
You can provide a configuration file to `electron-bridge-cli` with the following object:
```json
{
  "base": ".",
  "tsconfig": "tsconfig.json",
  "schemas": "schemas/",
  "output": "src/bridge/",
  "main": false,
  "verbose": false
}
```

| Key      | Default         | Description                                                           |
|---------:|----------------:|-----------------------------------------------------------------------|
| base     |             "." | Path used to target a directory other than current working directory. |
| tsconfig | "tsconfig.json" | Path to the tsconfig.json file of your project.                       |
| schemas  |      "schemas/" | Path where to look for schemas to parse.                              |
| output   |   "src/bridge/" | Path where to generate output files.                                  |
| main     |           false | true when used within `electron-bridge`, false otherwise.             |
| verbose  |           false | true to show more logs, false otherwise.                              |

By reusing your project `tsconfig.json` file, `electron-bridge-cli` will generate files with the same configuration and 
therefore provides the same indentation, new line kind, etc. as your project.

When generating files from schemas, `electron-bridge` is imported for you:
- when working on `electron-bridge`, you need to set `"main": true` to import modules relative to the package (e.g. `import {Bridge} from './bridge.ts'`).
- when working on any other project, you need to set `"main": false` to import modules from the package (e.g. `import {Bridge} from 'electron-bridge/main'`).

## Output files
Each schema will be generated in the `output` path using this structure:
```
${output}
  |
  |-- main/           # contains bridge classes (*.bridge.ts)
  |-- preload/        # contains module classes (*.module.ts)
  |-- renderer/       # contains api interfaces (*.api.ts) and augmented Window (renderer.ts)
```

## Schema
A schema is a single file you can write containing main process features to be exposed in the renderer process.
It uses a valid Typescript syntax to generate a bridge file, a module file and an api interface file.

Let's see what it looks like with this example:

> schemas/native-theme.ts
```typescript
import {BrowserWindow, nativeTheme} from 'electron';
import {Schema, EventListener} from 'electron-bridge-cli';

/**
 * Emitted when something in the underlying NativeTheme has changed.
 */
export interface ThemeUpdatedEvent {
  shouldUseDarkColors: boolean;
  shouldUseHighContrastColors: boolean;
  shouldUseInvertedColorScheme: boolean;
}

/**
 * Read and respond to changes in Chromium's native color theme.
 */
@Schema(false)
export class NativeTheme {
  
  constructor(private win: BrowserWindow) {
    
  }

  public register(): void {
    nativeTheme.on('updated', this.emitUpdated.bind(this));
  }

  public release(): void {
    nativeTheme.off('updated', this.emitUpdated.bind(this));
  }

  public async shouldUseDarkColors(): Promise<boolean> {
    return nativeTheme.shouldUseDarkColors;
  }

  public async themeSource(value: 'system' | 'light' | 'dark'): Promise<void> {
    nativeTheme.themeSource = value;
  }

  @EventListener('updated')
  public onUpdated(listener: (event: ThemeUpdatedEvent) => void): void {

  }

  private emitUpdated(): void {
    this.win.webContents.send('eb.nativeTheme.updated', {
      shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
      shouldUseHighContrastColors: nativeTheme.shouldUseHighContrastColors,
      shouldUseInvertedColorScheme: nativeTheme.shouldUseInvertedColorScheme,
    });
  }

}
```

You can see that the code is pretty simple to write and understand.
You can look at the generated code that `eb generate ./bridge.config.json` command would produce, 
[here](#output).

Let's dive into the specifics of this format.

#### 1. Schema decorator and class declaration
> schemas/native-theme.ts
```typescript
import {Schema} from 'electron-bridge-cli';

@Schema(false)
export class NativeTheme {
    // ...
}
```

You **must** decorate the class for which you want to create a bridge, a module and an api interface using `@Schema()`.

You **must** indicate a value for the parameter `readonly`:
- `true` means this bridge behaves without using any write operations on the user's device.
- `false` means this bridge behaves with the use of write operations on the user's device.

> `readonly` is currently not reused but still required as safety information.
> It shall be implemented in the future to quickly filter safe bridges to register.

You **must** export the class along with the decorator in order to be parsed by the tool.

You **must** declare one and only one exported class with the `@Schema` decorator per file.

#### 2. Class

> schemas/native-theme.ts
```typescript
// ...

/**
 * Read and respond to changes in Chromium's native color theme.
 */
@Schema(false)
export class NativeTheme {
    // ...
}
```

If you provide documentation for your class, it will be reused in the api interface file.

#### 3. Constructor
> schemas/native-theme.ts
```typescript
// ...
export class NativeTheme {

    // ...

    constructor(private win: BrowserWindow) {

    }

    // ...
}
```

You can declare it or not, it will be reused as-this in the bridge file.

If you need external dependencies from your Electron app file (`electron.dev.ts`), you can add parameters to the
constructor. You will then be able to call the constructor by passing such dependencies.

An example might be to pass your BrowserWindow instance in order to send events to the renderer process.

#### 4. Lifecycle
> schemas/native-theme.ts
```typescript
// ...
export class NativeTheme {

    // ...

    public register(): void {
        nativeTheme.on('updated', this.emitUpdated.bind(this));
    }

    public release(): void {
        nativeTheme.off('updated', this.emitUpdated.bind(this));
    }

    // ...
}
```

In the main process, a bridge **shall** be initialized after a BrowserWindow is instantiated.
It **shall** then be released after that same BrowserWindow [closed](https://www.electronjs.org/docs/latest/api/browser-window#event-closed).

`BridgeService` will call `register()` to initialize your bridge and call `release()` to release it.

You can override these two functions to listen to events, open / close a file, allocate / deallocate memory, etc.

> Note: when generated `register()` and `release()` functions will contain calls to add and remove IPC handlers.
> If you override one of these, be aware that your code will be appended at the beginning of the function, while 
> generated code will be appended after.

#### 5. Public functions
> schemas/native-theme.ts
```typescript
import {nativeTheme} from 'electron';

// ...
export class NativeTheme {

  // ...

  /**
   * Returns true when system is defined with a dark theme, false when system is defined with a light theme.
   */
  public async shouldUseDarkColors(): Promise<boolean> {
    return nativeTheme.shouldUseDarkColors;
  }

  public async themeSource(value: 'system' | 'light' | 'dark'): Promise<void> {
    nativeTheme.themeSource = value;
  }

  // ...
}
```

Here is where all the fun is happening:
- you **must** declare public a function you want to expose in the renderer process.
- you declare a function's signature that you want to expose in the renderer process.
- you write in the function the code that you want to be executed in the main process.
- you **must** set `async` to a function and returns with a `Promise<void>` or `Promise<something>`.
- you **can** declare a synchronous function and return `void` when it has a `fire-and-forget` kind logic.

The name of the function will be used to define a unique IPC handler.
And `electron-bridge-cli` will take care of the rest for you!

Documentation of a public function will be included in the api interface file.

#### 6. EventListener decorator
> schemas/native-theme.ts
```typescript
// ...
export class NativeTheme {

  // ...

  @EventListener('updated')
  public onUpdated(listener: (event: ThemeUpdatedEvent) => void): void {

  }

  // ...
}
```

You can expose event listeners by declaring a public function using a callback parameter:
- you **must** decorate your function with @EventListener.
- you **must** indicate the event name used for IPC channel.
- any code in the function will be **ignored**.

**Important:** you are still responsible for sending an event from the main process to the renderer process.
You **can** do so by using `WebContents` from your `BrowserWindow`:

`this.win.webContents.send('eb.[myBridge].[event-name]'/*, ...args*/);`.
- `[myBridge]` becomes `nativeTheme`.
- `[event-name]` becomes `updated`.

You can find an example in `emitUpdated()`.

#### 7. Private functions, classes and interfaces
> schemas/native-theme.ts
```typescript
import {nativeTheme} from 'electron';

// ...
export class NativeTheme {

  // ...

  private emitUpdated(): void {
    this.win.webContents.send('eb.nativeTheme.updated', {
      shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
      shouldUseHighContrastColors: nativeTheme.shouldUseHighContrastColors,
      shouldUseInvertedColorScheme: nativeTheme.shouldUseInvertedColorScheme,
    });
  }

  // ...
}
```

- any private / protected functions
- any properties / getters / setters
- any interfaces not exported
- any classes not exported

will only be included in the bridge class.

#### 8. Exported classes and interfaces
> schemas/native-theme.ts
```typescript
/**
 * Emitted when something in the underlying NativeTheme has changed.
 */
export interface ThemeUpdatedEvent {
  shouldUseDarkColors: boolean;
  shouldUseHighContrastColors: boolean;
  shouldUseInvertedColorScheme: boolean;
}
```

You can write exported classes and interfaces. They will only be included in the api interface file.
If you use them in the bridge class, they will be imported from the api interface module.

## Output
For one schema, three files are generated: a bridge class, a module interface and an api interface.
With our current schema, `electron-bridge-cli` would create the following files after executing 
`eb generate ./bridge.config.json`:

> src/bridge/main/native-theme.bridge.ts
```typescript
import {BrowserWindow, ipcMain, IpcMainInvokeEvent, nativeTheme} from 'electron';
import {Bridge} from 'electron-bridge-cli/main';

export class NativeThemeBridge implements Bridge {

  constructor(private win: BrowserWindow) {
    
  }

  public register(): void {
    nativeTheme.on('updated', this.emitUpdated.bind(this));
    ipcMain.handle('eb.nativeTheme.shouldUseDarkColors', async () => {
      return nativeTheme.shouldUseDarkColors;
    });
    ipcMain.handle('eb.nativeTheme.themeSource', async (_: IpcMainInvokeEvent, value: 'system' | 'light' | 'dark') => {
      nativeTheme.themeSource = value;
    });
  }

  public release(): void {
    nativeTheme.off('updated', this.emitUpdated.bind(this));
    ipcMain.removeHandler('eb.nativeTheme.shouldUseDarkColors');
    ipcMain.removeHandler('eb.nativeTheme.themeSource');
  }

  private emitUpdated(): void {
    this.win.webContents.send('eb.nativeTheme.updated', {
      shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
      shouldUseHighContrastColors: nativeTheme.shouldUseHighContrastColors,
      shouldUseInvertedColorScheme: nativeTheme.shouldUseInvertedColorScheme,
    });
  }

}
```

> src/bridge/preload/native-theme.module.ts
```typescript
import {ipcRenderer, IpcRendererEvent} from 'electron';
import {BridgeModule} from 'electron-bridge-cli/preload';
import {ThemeUpdatedEvent} from "../renderer/native-theme.api";

export const NativeThemeModule: BridgeModule = {
  name: 'nativeTheme',
  readonly: false,
  api: {
    shouldUseDarkColors: async () => {
      return await ipcRenderer.invoke('eb.nativeTheme.shouldUseDarkColors');
    },
    themeSource: async (value: 'system' | 'light' | 'dark') => {
      return await ipcRenderer.invoke('eb.nativeTheme.themeSource', value);
    },
    onUpdated: (listener: (event: ThemeUpdatedEvent) => void) => {
      ipcRenderer.on('eb.nativeTheme.updated', (_: IpcRendererEvent, event: ThemeUpdatedEvent) => {
        listener(event);
      });
    }
  }
};
```

> src/bridge/renderer/native-theme.api.ts
```typescript
/**
 * Emitted when something in the underlying NativeTheme has changed.
 */
export interface ThemeUpdatedEvent {
  shouldUseDarkColors: boolean;
  shouldUseHighContrastColors: boolean;
  shouldUseInvertedColorScheme: boolean;
}

/**
 * Read and respond to changes in Chromium's native color theme.
 */
export interface NativeThemeApi {

  /**
   * Returns true when system is defined with a dark theme, false when system is defined with a light theme.
   */
  shouldUseDarkColors(): Promise<boolean>;
  themeSource(value: 'system' | 'light' | 'dark'): Promise<void>;
  onUpdated(listener: (event: ThemeUpdatedEvent) => void): void;

}
```

> src/bridge/renderer/renderer.ts
```typescript
import {NativeThemeApi} from './native-theme.api';

declare global {
  interface Window {
    nativeTheme: NativeThemeApi;
  }
}
```

## ROI
> Why not?

For each schema, the number of lines is compared to the total number of lines from generated files. You'll know the rate
of lines you didn't have to write. It doesn't take into account the time you could have wasted jumping from one file 
back to another one.

| File                    | Number of lines |
|------------------------:|----------------:|
| schemas/native-theme.ts |              52 |
|                         |                 |
|  native-theme.bridge.ts |              34 |
|  native-theme.module.ts |              21 |
|     native-theme.api.ts |              22 |
|                         |                 |
|               **Total** |              77 |
|                 **ROI** |           ~32 % |

## Contributing

Feel free to contribute by creating an issue / submitting a pull-request.
