use std::error::Error;
use std::ops::Deref;
use std::path::PathBuf;
use std::{fs, sync::Mutex};
use tauri::{async_runtime::Receiver, AppHandle, Manager};
use tauri_plugin_shell::ShellExt;

use crate::notifications::show_error_notification;

use super::PartialSettings;
use super::Settings;

type ChangeHandler = Box<dyn Fn(&Settings, &Settings) + Send + Sync + 'static>;

pub struct SettingsManager {
    app: AppHandle,
    // Default settings aren't mutable, so no need to put them in mutex
    default_settings: Settings,
    user_settings_cache: Mutex<Option<PartialSettings>>,
    settings_flush_sender: tauri::async_runtime::Sender<PartialSettings>,
    change_handlers: Mutex<Vec<ChangeHandler>>,
}

impl SettingsManager {
    pub fn new(app: &AppHandle) -> Self {
        // TODO: debounce updates stream
        let (sender, receiver) = tauri::async_runtime::channel::<PartialSettings>(1000);
        SettingsManager::spawn_settings_flush_receiver(app, receiver);

        Self {
            app: app.clone(),
            default_settings: SettingsManager::read_default_settings(app),
            user_settings_cache: Mutex::new(None),
            settings_flush_sender: sender,
            change_handlers: Mutex::new(Vec::new()),
        }
    }

    pub fn read_settings(&self) -> Settings {
        let mut user_settings_cache = self.user_settings_cache.lock().unwrap();
        if let Some(user_settings) = (*user_settings_cache).clone() {
            return Settings::from(user_settings, self.default_settings.clone());
        }
        let user_settings = self.read_user_settings();
        *user_settings_cache = Some(user_settings.clone());

        Settings::from(user_settings, self.default_settings.clone())
    }

    pub fn update_settings(&self, updated_settings: PartialSettings) {
        let mut user_settings_cache = self.user_settings_cache.lock().unwrap();

        // In practice, we'll always have a cache at this point, since update is always used after read
        let user_settings = (*user_settings_cache)
            .clone()
            .unwrap_or_else(|| self.read_user_settings());
        let old_settings =
            Settings::from(user_settings.clone(), self.default_settings.clone()).clone();
        let updated_user_settings = user_settings.update(updated_settings);

        // Immediately update in-memory cache and schedule writing to disk
        *user_settings_cache = Some(updated_user_settings.clone());
        self.settings_flush_sender
            .blocking_send(updated_user_settings.clone())
            .unwrap();

        let new_settings = Settings::from(updated_user_settings, self.default_settings.clone());

        // Drop mutex before calling change handlers to avoid deadlock
        // This allows change handlers to call read_settings without deadlocking
        drop(user_settings_cache);

        self.call_change_handlers(&old_settings, &new_settings);
    }

    pub fn reset_to_default(&self) {
        self.update_settings(PartialSettings::default());
    }

    pub fn add_change_handler<F>(&self, handler: F)
    where
        F: Fn(&Settings, &Settings) + Send + Sync + 'static,
    {
        self.change_handlers.lock().unwrap().push(Box::new(handler));
    }

    pub fn read_default_settings(app: &AppHandle) -> Settings {
        let resources_dir = app.path().resource_dir().unwrap();

        let default_settings_path = resources_dir
            .join("resources")
            .join("default_settings.json");
        let default_settings_json = fs::read_to_string(default_settings_path).unwrap();
        let default_settings: Settings = serde_json::from_str(&default_settings_json).unwrap();

        default_settings
    }

    pub fn open_settings_file(&self) {
        let user_settings_path = SettingsManager::get_user_settings_path(&self.app);
        self.app
            .shell()
            .open(user_settings_path.to_str().unwrap(), None)
            .unwrap_or_else(|e| {
                show_error_notification(&self.app, Box::new(e), "Error opening settings file.")
            });
    }

    fn call_change_handlers(&self, old_settings: &Settings, new_settings: &Settings) {
        for change_handler in self.change_handlers.lock().unwrap().deref() {
            change_handler(old_settings, new_settings);
        }
    }

    fn read_user_settings(&self) -> PartialSettings {
        self.try_read_user_settings().unwrap_or_else(|e| {
            show_error_notification(&self.app, e, "Error reading user settings.");
            PartialSettings::default()
        })
    }

    fn try_read_user_settings(&self) -> Result<PartialSettings, Box<dyn Error>> {
        let user_settings_path = SettingsManager::get_user_settings_path(&self.app);

        if user_settings_path.exists() {
            let user_settings_json = fs::read_to_string(user_settings_path)?;
            Ok(serde_json::from_str(&user_settings_json)?)
        } else {
            Ok(PartialSettings::default())
        }
    }

    fn spawn_settings_flush_receiver(app: &AppHandle, mut receiver: Receiver<PartialSettings>) {
        let settings_path = SettingsManager::get_user_settings_path(app);

        // Make sure settings dir exists
        let settings_dir = settings_path.parent().unwrap();
        fs::create_dir_all(settings_dir).unwrap();

        tauri::async_runtime::spawn(async move {
            loop {
                while let Some(settings) = receiver.recv().await {
                    let settings_json = serde_json::to_string_pretty(&settings).unwrap();
                    fs::write(settings_path.clone(), settings_json).unwrap();
                }
            }
        });
    }

    fn get_user_settings_path(app: &AppHandle) -> PathBuf {
        let settings_dir = app.path().app_config_dir().unwrap();
        let settings_path = settings_dir.join("settings.json");
        settings_path
    }
}
