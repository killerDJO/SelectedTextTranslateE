// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use events_manager::EventsManager;
use log::error;
use shortcuts_manager::ShortcutsManager;
use tauri::Manager;
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_log::{RotationStrategy, Target, TargetKind};

mod commands;
mod events_manager;
mod notifications;
mod requests_executor;
mod settings;
mod shortcuts_manager;
mod text_extractor;
mod tray_icon;
mod window_manager;

use settings::SettingsManager;
use text_extractor::TextExtractor;
use tray_icon::AppTrayIcon;

fn main() {
    std::panic::set_hook(Box::new(|info| {
        error!("Application panicked: {:?}", info);
    }));

    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|_app, _args, _cwd| {}))
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::LogDir { file_name: None }),
                ])
                .max_file_size(10 * 1024 * 1024) // 10 Megabytes
                .rotation_strategy(RotationStrategy::KeepAll)
                .build(),
        )
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        .setup(|app| {
            let settings_manager = SettingsManager::new(app.handle());
            let events_manager = EventsManager::new();

            // Notify the frontend about settings changes
            let app_handle = app.handle().clone();
            settings_manager.add_change_handler(move |_, settings| {
                EventsManager::emit_settings_changed_event(&app_handle, settings);
            });

            app.manage(settings_manager);
            app.manage(events_manager);
            app.manage(ShortcutsManager::new(app.handle()));
            app.manage(TextExtractor::new(app.handle()));
            app.manage(AppTrayIcon::new(app.handle()));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::accent_color,
            commands::clipboard_text,
            commands::execute_google_translate_request,
            commands::last_translation_command,
            commands::settings,
            commands::update_settings,
            commands::default_settings,
            commands::open_settings_file,
            commands::reset_settings_to_default,
            commands::notify_on_frontend_error,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_app_handle, event| match event {
            tauri::RunEvent::ExitRequested { api, .. } => {
                api.prevent_exit();
            }
            _ => {}
        });
}
