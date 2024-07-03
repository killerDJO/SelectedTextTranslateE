# Selected Text Translate

![Selected Text Translate Build](https://github.com/killerDJO/SelectedTextTranslateE/workflows/Selected%20Text%20Translate%20Build/badge.svg?branch=master)

# Development Setup

## Prerequisites

1. Node.js 20+
2. Visual Studio Code.

## Components

Solution contains 3 main source trees:

- `src`: Main Web application. Uses Vue 3 and Vite as a bundler.
- `src-tauri`: Tauri source code, provide native OS functionality, like windows management, tray icons & hotkeys. Also, manages app settings.
- `src-tauri-macros`: Rust macros for easier settings handling. Use a separate crate to satisfy Rust compiler.

## Commands

- `tauri:dev` - run tauri in development mode.
- `tauri:build` - build in production mode and create installer/updater.
- `lint` - run eslint checks on all files.

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

## Releasing

In order to create a new release the following steps must be done:

1. Increment application version in `tauri.conf.json`.
2. Push changes to GitHub.
3. Create a new tag that matches a release version, e.g. `v1.2.3`, push this tag to GitHub.
4. Wait for release action to complete.
