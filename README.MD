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

## Supabase

In order to provide history synchronization functionality Supabase is used as a backend. It must be configured before starting the application, otherwise history sync won't work.

Steps to connect Supabase to a project:

1. Install Supabase CLI - https://supabase.com/docs/guides/cli
2. Execute `supabase login` command.
3. Link to a remote project using `supabase link  --project-ref <ref>`.

### Migrations

1. Migrations should be written in a `supabase/migrations` folder.
2. To push a new migration to a server, run `supabase db push -p <db password command>`
3. To fetch latest TypeScript types, use the following command: `supabase gen types typescript --project-id <projectId> src/components/history/services/database.generated.ts`

### Auth configuration

1. Disable Anonymous sign-ups in Auth Project settings
2. Enable Email Auth provider in Authentication > Provider settings. Disable `Confirm email`, `Secure email change` and `Secure password change` features.
3. Use `supabase/email-templates/otp.template.html` as a `Magic Link` email template. Use `Selected Text Translate > Login` as email subject.

## Releasing

In order to create a new release the following steps must be done:

1. Increment application version in `tauri.conf.json`.
2. Push changes to GitHub.
3. Create a new tag that matches a release version, e.g. `v1.2.3`, push this tag to GitHub.
4. Wait for release action to complete.
