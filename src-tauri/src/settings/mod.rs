use selected_text_translate_macros::{settings, Partial};
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

mod settings_manager;

pub use settings_manager::SettingsManager;

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
    pub supabase: SupabaseSettings,
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
    pub supabase: Option<PartialSupabaseSettings>,
}

#[settings]
pub struct CoreSettings {
    pub copy_delay_milliseconds: u64,
    pub request_timeout_milliseconds: u32,
    pub log_requests: bool,
    pub play_volume: u32,
    pub search_pattern: String,
    pub last_records_to_scan_for_merge: u32,
    pub levenshtein_distance_for_merge: u8,
    pub proxy: Option<String>,
}

#[settings]
pub struct TranslationSettings {
    pub source_language: String,
    pub target_language: String,
    pub tags: Vec<Tag>,
}

#[settings]
pub struct Tag {
    pub tag: String,
    pub enabled: bool,
}

#[settings]
pub struct DisplaySettings {
    pub visible_by_default_translations_in_category: u8,
    pub history_page_size: u16,
    pub history_columns: HistoryColumns,
}

#[settings]
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

#[settings]
pub struct HistoryColumn {
    visible: bool,
    weight: f32,
    index: u8,
}

#[settings]
pub struct TranslationWindowSettings {
    pub width: u32,
    pub height: u32,
    pub min_width: u32,
    pub min_height: u32,
    pub x: Option<i32>,
    pub y: Option<i32>,
    pub margin: u32,
}

#[settings]
pub struct WindowSettings {
    pub width_percentage: u8,
    pub height_percentage: u8,
    pub min_width: u32,
    pub min_height: u32,
}

#[settings]
pub struct ScalingSettings {
    pub scale_factor: f32,
    pub scale_translation_view_only: bool,
    pub scaling_step: f32,
    pub min_scaling: f32,
    pub max_scaling: f32,
    pub vertical_resolution_baseline: u32,
}

pub type Keys = Vec<String>;

#[settings]
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

#[settings]
pub struct SupabaseSettings {
    pub project_url: String,
    pub anon_key: String,
}

pub trait UpdatableSettings
where
    Self: Sized,
{
    fn update(&self, updated_settings: core::option::Option<Self>) -> Self;
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
            supabase: SupabaseSettings::from(
                user_settings.supabase.unwrap_or_default(),
                default_settings.supabase,
            ),
        }
    }
}

impl PartialSettings {
    pub fn update(&self, updated_settings: PartialSettings) -> Self {
        Self {
            core: Self::update_settings(self.core.clone(), updated_settings.core),
            translation: Self::update_settings(
                self.translation.clone(),
                updated_settings.translation,
            ),
            display: Self::update_settings(self.display.clone(), updated_settings.display),
            translation_window: Self::update_settings(
                self.translation_window.clone(),
                updated_settings.translation_window,
            ),
            history_window: Self::update_settings(
                self.history_window.clone(),
                updated_settings.history_window,
            ),
            settings_window: Self::update_settings(
                self.settings_window.clone(),
                updated_settings.settings_window,
            ),
            scaling: Self::update_settings(self.scaling.clone(), updated_settings.scaling),
            hotkeys: Self::update_settings(self.hotkeys.clone(), updated_settings.hotkeys),
            supabase: Self::update_settings(self.supabase.clone(), updated_settings.supabase),
        }
    }

    fn update_settings<T>(current_settings: Option<T>, updated_settings: Option<T>) -> Option<T>
    where
        T: Clone + UpdatableSettings,
    {
        current_settings.map_or(updated_settings.clone(), |current_settings| {
            Some(current_settings.update(updated_settings))
        })
    }
}
