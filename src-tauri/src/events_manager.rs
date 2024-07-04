use std::sync::Mutex;

use serde::Serialize;
use tauri::{AppHandle, Manager, WebviewWindow};

use crate::settings::Settings;

const ACCENT_COLOR_CHANGED_EVENT: &str = "accent_color_changed";

const BEFORE_SHOW_EVENT: &str = "before_show";
const TRANSLATE_TEXT_COMMAND: &str = "translate_text";
const PLAY_TEXT_COMMAND: &str = "play_text";
const SHOW_INPUT_COMMAND: &str = "show_input";

pub const PLAY_START_EVENT: &str = "play_start";
pub const PLAY_STOP_EVENT: &str = "play_stop";

pub const SETTINGS_CHANGED_EVENT: &str = "settings_changed";

pub const PAUSE_HOTKEYS_EVENT: &str = "pause_hotkeys";
pub const RESUME_HOTKEYS_EVENT: &str = "resume_hotkeys";

#[derive(Serialize, Clone)]
pub enum TranslationCommands {
    Translate(bool),
    Play,
    ShowInput,
}

pub struct EventsManager {
    // Stores last translation command, so translation window can check it upon initial load
    pub last_translation_command: Mutex<Option<TranslationCommands>>,
}

#[derive(Serialize, Clone)]
struct TranslateTextCommandData {
    pub show_definition: bool,
}

impl EventsManager {
    pub fn new() -> Self {
        Self {
            last_translation_command: Mutex::new(None),
        }
    }

    pub fn emit_before_show_event(window: &WebviewWindow) {
        window.emit(BEFORE_SHOW_EVENT, ()).unwrap();
    }

    pub fn emit_accent_color_changed_event(app: &AppHandle, color: String) {
        app.emit(ACCENT_COLOR_CHANGED_EVENT, color).unwrap();
    }

    pub fn emit_translate_text_command(&self, window: &WebviewWindow, show_definition: bool) {
        window
            .emit(
                TRANSLATE_TEXT_COMMAND,
                TranslateTextCommandData { show_definition },
            )
            .unwrap();
        self.set_last_translation_command(TranslationCommands::Translate(show_definition));
    }

    pub fn emit_play_text_command(&self, window: &WebviewWindow) {
        window.emit(PLAY_TEXT_COMMAND, ()).unwrap();
        self.set_last_translation_command(TranslationCommands::Play);
    }

    pub fn emit_show_input_command(&self, window: &WebviewWindow) {
        window.emit(SHOW_INPUT_COMMAND, ()).unwrap();
        self.set_last_translation_command(TranslationCommands::ShowInput);
    }

    pub fn emit_settings_changed_event(app: &AppHandle, settings: &Settings) {
        app.emit(SETTINGS_CHANGED_EVENT, settings).unwrap();
    }

    fn set_last_translation_command(&self, command: TranslationCommands) {
        let mut last_translation_command = self.last_translation_command.lock().unwrap();
        *last_translation_command = Some(command);
    }
}
