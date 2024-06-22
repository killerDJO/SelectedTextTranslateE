use selected_text_translate_macros::Partial;
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

mod settings_manager;

pub use settings_manager::SettingsManager;

pub type Keys = Vec<String>;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub core: CoreSettings,
    pub translation: TranslationSettings,
    pub display: DisplaySettings,
    pub translation_window: TranslationWindowSettings,
    pub history_window: WindowSettings,
    pub settings_window: WindowSettings,
    pub scaling: ScalingSettings,
    pub hotkeys: HotkeySettings,
    pub firebase: FirebaseSettings,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct PartialSettings {
    pub core: Option<PartialCoreSettings>,
    pub translation: Option<PartialTranslationSettings>,
    pub display: Option<PartialDisplaySettings>,
    pub translation_window: Option<PartialTranslationWindowSettings>,
    pub history_window: Option<PartialWindowSettings>,
    pub settings_window: Option<PartialWindowSettings>,
    pub scaling: Option<PartialScalingSettings>,
    pub hotkeys: Option<PartialHotkeySettings>,
    pub firebase: Option<PartialFirebaseSettings>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Partial)]
#[serde(rename_all = "camelCase")]
pub struct CoreSettings {
    pub copy_delay_milliseconds: u64,
    pub request_timeout_milliseconds: u32,
    pub play_volume: u32,
    pub search_pattern: String,
    pub last_records_to_scan_for_merge: u32,
    pub proxy: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Partial)]
#[serde(rename_all = "camelCase")]
pub struct TranslationSettings {
    pub source_language: String,
    pub target_language: String,
    pub tags: Vec<Tag>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Tag {
    pub tag: String,
    pub enabled: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone, Partial)]
#[serde(rename_all = "camelCase")]
pub struct DisplaySettings {
    pub visible_by_default_translations_in_category: u8,
    pub history_page_size: u16,
    pub history_columns: HistoryColumns,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct HistoryColumns {
    input: HistoryColumn,
    translation: HistoryColumn,
    tags: HistoryColumn,
    times_translated: HistoryColumn,
    last_translated_date: HistoryColumn,
    source_language: HistoryColumn,
    target_language: HistoryColumn,
    archived: HistoryColumn,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct HistoryColumn {
    visible: bool,
    weight: f32,
    index: u8,
}

#[derive(Serialize, Deserialize, Debug, Clone, Partial)]
#[serde(rename_all = "camelCase")]
pub struct TranslationWindowSettings {
    pub width: u32,
    pub height: u32,
    pub min_width: u32,
    pub min_height: u32,
    pub x: Option<i32>,
    pub y: Option<i32>,
    pub margin: u32,
}

#[derive(Serialize, Deserialize, Debug, Clone, Partial)]
#[serde(rename_all = "camelCase")]
pub struct WindowSettings {
    pub width_percentage: u8,
    pub height_percentage: u8,
    pub min_width: u32,
    pub min_height: u32,
}

#[derive(Serialize, Deserialize, Debug, Clone, Partial)]
#[serde(rename_all = "camelCase")]
pub struct ScalingSettings {
    pub scale_factor: f32,
    pub scale_translation_view_only: bool,
    pub scaling_step: f32,
    pub min_scaling: f32,
    pub max_scaling: f32,
    pub vertical_resolution_baseline: u32,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Partial)]
#[serde(rename_all = "camelCase")]
pub struct HotkeySettings {
    pub translate: Vec<Keys>,
    pub play_text: Vec<Keys>,
    pub show_definition: Vec<Keys>,
    pub input_text: Vec<Keys>,
    pub toggle_suspend: Vec<Keys>,
    pub zoom_in: Vec<Keys>,
    pub zoom_out: Vec<Keys>,
    pub reset_zoom: Vec<Keys>,
    pub toggle_definition: Vec<Keys>,
    pub archive_result: Vec<Keys>,
    pub add_tag: Vec<Keys>,
    pub toggle_tags: Vec<Keys>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Partial)]
#[serde(rename_all = "camelCase")]
pub struct FirebaseSettings {
    pub api_key: String,
    pub auth_domain: String,
    pub project_id: String,
}

impl Settings {
    pub fn from(user_settings: PartialSettings, default_settings: Settings) -> Self {
        Settings {
            core: CoreSettings::from(
                user_settings.core.unwrap_or_default(),
                default_settings.core,
            ),
            translation: TranslationSettings::from(
                user_settings.translation.unwrap_or_default(),
                default_settings.translation,
            ),
            display: DisplaySettings::from(
                user_settings.display.unwrap_or_default(),
                default_settings.display,
            ),
            translation_window: TranslationWindowSettings::from(
                user_settings.translation_window.unwrap_or_default(),
                default_settings.translation_window,
            ),
            history_window: WindowSettings::from(
                user_settings.history_window.unwrap_or_default(),
                default_settings.history_window,
            ),
            settings_window: WindowSettings::from(
                user_settings.settings_window.unwrap_or_default(),
                default_settings.settings_window,
            ),
            scaling: ScalingSettings::from(
                user_settings.scaling.unwrap_or_default(),
                default_settings.scaling,
            ),
            hotkeys: HotkeySettings::from(
                user_settings.hotkeys.unwrap_or_default(),
                default_settings.hotkeys,
            ),
            firebase: FirebaseSettings::from(
                user_settings.firebase.unwrap_or_default(),
                default_settings.firebase,
            ),
        }
    }
}

impl PartialSettings {
    pub fn update(&self, updated_settings: PartialSettings) -> Self {
        Self {
            core: self
                .core
                .clone()
                .map_or(updated_settings.core.clone(), |core| {
                    Some(core.update(updated_settings.core))
                }),
            translation: self
                .translation
                .clone()
                .map_or(updated_settings.translation.clone(), |translation| {
                    Some(translation.update(updated_settings.translation))
                }),
            display: self
                .display
                .clone()
                .map_or(updated_settings.display.clone(), |display| {
                    Some(display.update(updated_settings.display))
                }),
            translation_window: self.translation_window.clone().map_or(
                updated_settings.translation_window.clone(),
                |translation_window| {
                    Some(translation_window.update(updated_settings.translation_window))
                },
            ),
            history_window: self
                .history_window
                .clone()
                .map_or(updated_settings.history_window.clone(), |history_window| {
                    Some(history_window.update(updated_settings.history_window))
                }),
            settings_window: self.settings_window.clone().map_or(
                updated_settings.settings_window.clone(),
                |settings_window| Some(settings_window.update(updated_settings.settings_window)),
            ),
            scaling: self
                .scaling
                .clone()
                .map_or(updated_settings.scaling.clone(), |scaling| {
                    Some(scaling.update(updated_settings.scaling))
                }),
            hotkeys: self
                .hotkeys
                .clone()
                .map_or(updated_settings.hotkeys.clone(), |hotkeys| {
                    Some(hotkeys.update(updated_settings.hotkeys))
                }),
            firebase: self
                .firebase
                .clone()
                .map_or(updated_settings.firebase.clone(), |firebase| {
                    Some(firebase.update(updated_settings.firebase))
                }),
        }
    }
}
