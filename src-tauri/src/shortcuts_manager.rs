use std::{
    error::Error,
    str::FromStr,
    sync::{Arc, Mutex},
};

use tauri::{AppHandle, Listener, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

use crate::{
    events_manager::{EventsManager, PAUSE_HOTKEYS_EVENT, RESUME_HOTKEYS_EVENT},
    notifications::show_error_notification,
    settings::{HotkeySettings, Keys, SettingsManager},
    text_extractor::TextExtractor,
    window_manager,
};

type ChangeHandler = Box<dyn Fn(bool) + Send + Sync + 'static>;

#[derive(Clone)]
pub struct ShortcutsManager {
    app: AppHandle,
    registered_shortcuts: Arc<Mutex<Vec<Shortcut>>>,
    suspended: Arc<Mutex<bool>>,
    suspend_change_handlers: Arc<Mutex<Vec<ChangeHandler>>>,
}

impl ShortcutsManager {
    pub fn new(app: &AppHandle) -> Self {
        let shortcuts_manager = Self {
            app: app.clone(),
            registered_shortcuts: Arc::new(Mutex::new(Vec::new())),
            suspended: Arc::new(Mutex::new(false)),
            suspend_change_handlers: Arc::new(Mutex::new(Vec::new())),
        };

        shortcuts_manager.register_shortcuts(false);
        shortcuts_manager.watch_hotkeys_state_events();

        let settings_manager = app.state::<SettingsManager>();
        let self_clone = shortcuts_manager.clone();
        settings_manager.add_change_handler(move |old_settings, new_settings| {
            if Self::are_global_hotkeys_changed(&old_settings.hotkeys, &new_settings.hotkeys) {
                // If shortcuts are suspended, we just need to re-register toggle suspend shortcut
                self_clone.register_shortcuts(self_clone.is_suspended());
            }
        });

        shortcuts_manager
    }

    pub fn is_suspended(&self) -> bool {
        *self.suspended.lock().unwrap()
    }

    pub fn suspend(&self) {
        // Do nothing if shortcuts are already suspended
        if self.is_suspended() {
            return;
        }

        self.register_shortcuts(true);
        *self.suspended.lock().unwrap() = true;

        self.call_suspend_change_handlers(true);
    }

    pub fn enable(&self) {
        // Do nothing if shortcuts are already enabled
        if !self.is_suspended() {
            return;
        }

        self.register_shortcuts(false);
        *self.suspended.lock().unwrap() = false;

        self.call_suspend_change_handlers(false);
    }

    pub fn toggle_suspend(&self) {
        if self.is_suspended() {
            self.enable();
        } else {
            self.suspend();
        }
    }

    pub fn add_suspend_change_handler<F>(&self, handler: F)
    where
        F: Fn(bool) + Send + Sync + 'static,
    {
        self.suspend_change_handlers
            .lock()
            .unwrap()
            .push(Box::new(handler));
    }

    fn register_shortcuts(&self, toggle_suspend_shortcut_only: bool) {
        let settings_manager = self.app.state::<SettingsManager>();
        let settings = settings_manager.read_settings().hotkeys;

        self.unregister_all();

        let self_clone = self.clone();
        self.register_shortcut(&settings.toggle_suspend, "Toggle Suspend", move |_| {
            self_clone.handle_toggle_suspend_shortcut();
        });

        // If shortcuts have been suspended, we re-register only toggle suspend shortcut upon settings change
        // In this case, we skip all other shortcuts registration
        if toggle_suspend_shortcut_only {
            return;
        }

        self.register_shortcut(&settings.translate, "Translate Text", |app| {
            Self::handle_translate_command(app, false);
        });

        self.register_shortcut(&settings.show_definition, "Show Definition", |app| {
            Self::handle_translate_command(app, true);
        });

        self.register_shortcut(&settings.play_text, "Play Text", |app| {
            app.state::<TextExtractor>().copy_selected_text();
            let (window, _) = window_manager::get_or_create_translation_window(app, true);
            app.state::<EventsManager>().emit_play_text_command(&window);
        });

        self.register_shortcut(&settings.input_text, "Show Input", |app| {
            let window = window_manager::show_translation_window(app);
            app.state::<EventsManager>()
                .emit_show_input_command(&window);
        });
    }

    fn handle_translate_command(app: &AppHandle, show_definition: bool) {
        app.state::<TextExtractor>().copy_selected_text();
        let window = window_manager::show_translation_window(app);
        app.state::<EventsManager>()
            .emit_translate_text_command(&window, show_definition)
    }

    fn handle_toggle_suspend_shortcut(&self) {
        let self_clone = self.clone();
        let app_clone = self.app.clone();

        // Shortcuts can only be registered/unregistered on the main thread
        // However, if we'll try to unregister them immediately, we'll run into a deadlock with global_shortcut plugin
        // Because of this, we do a roundtrip through the background thread to a main thread
        tauri::async_runtime::spawn(async move {
            app_clone
                .run_on_main_thread(move || {
                    if self_clone.is_suspended() {
                        self_clone.enable();
                    } else {
                        self_clone.suspend();
                    }
                })
                .unwrap();
        });
    }

    fn watch_hotkeys_state_events(&self) {
        let app = self.app.app_handle();

        let shortcuts_manager = self.clone();
        app.listen(PAUSE_HOTKEYS_EVENT, move |_| {
            shortcuts_manager.unregister_all();
        });

        let shortcuts_manager = self.clone();
        app.listen(RESUME_HOTKEYS_EVENT, move |_| {
            shortcuts_manager.register_shortcuts(shortcuts_manager.is_suspended())
        });
    }

    fn call_suspend_change_handlers(&self, is_suspended: bool) {
        for change_handler in self.suspend_change_handlers.lock().unwrap().iter() {
            change_handler(is_suspended);
        }
    }

    fn register_shortcut<F>(&self, hotkeys: &Vec<Keys>, title: &str, handler: F)
    where
        F: Fn(&AppHandle) + Send + Sync + 'static,
    {
        let handler = Arc::new(Box::new(handler));
        let mut registered_shortcuts = self.registered_shortcuts.lock().unwrap();

        for hotkey in hotkeys {
            let built_shortcut_result = Self::build_shortcut(hotkey);
            let hotkey_display_string = hotkey.join(" + ");
            let bind_error_message = format!(
                "Error binding \"{title}\" hotkey with \"{hotkey_display_string}\" combination."
            );

            // In case of error, show error notification and skip to the next hotkey
            if built_shortcut_result.is_err() {
                show_error_notification(
                    &self.app,
                    built_shortcut_result.err().unwrap(),
                    bind_error_message,
                );
                continue;
            }

            let shortcut = built_shortcut_result.unwrap();
            let handler_clone = handler.clone();

            self.app
                .global_shortcut()
                .on_shortcut(shortcut.clone(), move |app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        handler_clone(&app);
                    }
                })
                .map(|_| registered_shortcuts.push(shortcut.clone()))
                .unwrap_or_else(|err| {
                    show_error_notification(&self.app, Box::new(err), bind_error_message)
                })
        }
    }

    fn unregister_all(&self) {
        let mut registered_shortcuts = self.registered_shortcuts.lock().unwrap();
        for shortcut in registered_shortcuts.iter() {
            self.app
                .global_shortcut()
                .unregister(shortcut.clone())
                .unwrap();
        }
        registered_shortcuts.clear();
    }

    fn build_shortcut(keys: &Keys) -> Result<Shortcut, Box<dyn Error>> {
        let mut modifiers = Modifiers::empty();
        let mut code: Option<Code> = None;

        for key in keys {
            match key.as_str() {
                "Control" => modifiers |= Modifiers::CONTROL,
                "Shift" => modifiers |= Modifiers::SHIFT,
                "Alt" => modifiers |= Modifiers::ALT,
                key => code = Some(Code::from_str(key)?),
            };
        }

        Ok(Shortcut::new(
            Some(modifiers),
            code.ok_or("No key code found. Key combination is invalid.".to_string())?,
        ))
    }

    fn are_global_hotkeys_changed(
        old_settings: &HotkeySettings,
        new_settings: &HotkeySettings,
    ) -> bool {
        return old_settings.translate != new_settings.translate
            || old_settings.input_text != new_settings.input_text
            || old_settings.show_definition != new_settings.show_definition
            || old_settings.toggle_suspend != new_settings.toggle_suspend
            || old_settings.play_text != new_settings.play_text;
    }
}
