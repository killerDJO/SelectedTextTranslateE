use serde::Serialize;
use tauri::{AppHandle, Manager, WebviewWindow};

use crate::settings::Settings;

const BEFORE_SHOW_EVENT: &str = "before_show";
const TRANSLATE_TEXT_COMMAND: &str = "translate_text";
const PLAY_TEXT_COMMAND: &str = "play_text";
const SHOW_INPUT_COMMAND: &str = "show_input";

pub const PLAY_START_EVENT: &str = "play_start";
pub const PLAY_STOP_EVENT: &str = "play_stop";
pub const SETTINGS_CHANGED_EVENT: &str = "settings_changed";

#[derive(Serialize, Clone)]
struct TranslateTextCommandData {
    pub show_definition: bool,
}

pub fn emit_before_show_event(window: &WebviewWindow) {
    window.emit(BEFORE_SHOW_EVENT, ()).unwrap();
}

pub fn emit_translate_text_command(window: &WebviewWindow, show_definition: bool) {
    window
        .emit(
            TRANSLATE_TEXT_COMMAND,
            TranslateTextCommandData { show_definition },
        )
        .unwrap();
}

pub fn emit_play_text_command(window: &WebviewWindow) {
    window.emit(PLAY_TEXT_COMMAND, ()).unwrap();
}

pub fn emit_show_input_command(window: &WebviewWindow) {
    window.emit(SHOW_INPUT_COMMAND, ()).unwrap();
}

pub fn emit_settings_changed_event(app: &AppHandle, settings: &Settings) {
    app.emit(SETTINGS_CHANGED_EVENT, settings).unwrap();
}
