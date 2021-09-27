# electron-bridge-cli

`electron-bridge-cli` is a tool to quickly create main / renderer process bridges for [`electron-bridge`](/).
This is used internally to generate bridges in `electron-bridge`.
You can use this command line interface to create your own custom modules.

## Install
```shell script
$ npm install --save-dev electron-bridge-cli
```

## How to use

### 
### 1. Structure of files
`electron-bridge` need three files to expose a main process feature to the renderer process:

```typescript
import {ipcMain} from 'electron';
import {Bridge} from 'electron-bridge/main';

export class MyFeatureBridge implements Bridge {

  public register(): void {
    ipcMain.handle('eb.myFeature.sayHello', () => {
      
    });
  }

  public release(): void {
    
  }

}
```
| File                 | Description           |
|----------------------|-----------------------|
| my-feature.bridge.ts |                       |
| my-feature.module.ts |                       |
| my-feature.api.ts    |                       |
