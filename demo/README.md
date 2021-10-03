# Demo
Here is a simple demo where you can test implemented bridges.

## Build
```shell
$ npm run build
```

It will bundle scripts with webpack using two configurations:

#### 1. preloadConfig
Used to bundle `electron.preload.js` script.

#### 2. rendererConfig
Bundle Typescript modules to `index.js` with hot reload enabled.
Feel free to test features by editing the code and check it live!

## Serve
```shell
$ npm run serve
```
Start lite-server to serve `dist/` content to Electron.

## Electron
```shell
$ npm run electron
```

Run Electron application.