# Selected Text Translate

![Selected Text Translate Build](https://github.com/killerDJO/SelectedTextTranslateE/workflows/Selected%20Text%20Translate%20Build/badge.svg?branch=master)

# Development Setup

## Prerequisites

1. Node.js 20+
2. Visual Studio Code for development.

## Components and build tasks

Solution contains 2 components: main and renderer. Main component is build using `tsc`. Renderer component uses Vue 3 and built using Vite.

Main component is a Node.js process which ties all other processes together. There are 3 build tasks available:

- `build:main` - builds main component.
- `watch:main` - builds main component and watches for new changes. Used for development purposes.d
- `native-rebuild` - rebuilds native node modules against electron library. **Must** be executed every time electron's version is updated or native module changes.

Renderer component runs inside a browser and provides UI. There are 3 build tasks available:

- `build:renderer` - builds renderer.
- `watch:renderer` - builds renderer component and watches for new changes. Used for development purposes.

### Build tasks

- `build` - builds all components.
- `pack` - packages an app from `dist` folder into a self-contained package. `electron-packager` module is used. During this process development settings can be replaced with production settings from `build-scripts\resources\production-settings.json` file.
- `create-installer` - creates `Squirrel.Windows` installer from a packaged app. `electron-winstaller` module is used for this purpose.
- `create-release` - complex task which creates a read-to-use installer from a source code. Executes the following build tasks in order: `native-rebuild` -> `build` -> `pack` -> `create-installer`.

### Firebase setup

In order to provide history synchronization functionality firebase is used as a backend. It must be configured before starting the application, otherwise history sync won't work. Most of the setup can be executed by navigating to the `src\firebase` folder and deploying an application from there. See [deploy guide](https://firebase.google.com/docs/hosting/deploying) for details.

The password restore functionality should be configured additionally by providing a custom email template. To do this, navigate to `Firebase Console -> Authentication -> Templates -> Change Password` and provide the following items:

```
<p>Hello,</p>
<p>Follow this link to get your password reset code for your %EMAIL% account.</p>
<p><a href='%LINK%'>%LINK%</a></p>
<p>If you didn’t ask to reset your password, you can ignore this email.</p>
```

Action URL: `https://<project-id>.firebaseapp.com/reset-code.html`
Project name should also be configured in firebase to provide meaningful `%APP_NAME%`.

Current firebase project can be specified in the application settings in the `firebase` section.

## Development and debugging

To start/debug an application a VS Code launch task has been configured (available on `F5` hotkey).
Main component can be immediately debugged after start. To debug renderer and service components a Chrome debugger should be used, it can be toggled using `Ctrl + Shift + I` command on an open application window.

To enable windows notifications for development build the Selected Text Translate - Dev.lnk file should be added to the explorer's start menu list: `C:\Users\<username>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs`. Path in this shortcut should be updated to point to the local electron.exe - `<project_path>\node_modules\electron\dist\electron.exe`

## Releasing

In order to create a new release the following steps must be done:

1. Increment application version in `package.json`.
2. Execute `create-release` build task.
3. Create a new release on GitHub releases and upload files from `dist\installer`. Releases are read from there by [update.electronjs.org](https://github.com/electron/update.electronjs.org).
