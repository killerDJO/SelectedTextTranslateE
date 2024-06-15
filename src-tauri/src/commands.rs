use tauri::AppHandle;

use crate::{
    settings::{PartialSettings, Settings, SettingsManager},
    text_extractor::TextExtractor,
};

#[tauri::command]
pub fn accent_color() -> String {
    let mut colorization: u32 = 0;
    let mut opaqueblend = windows::Win32::Foundation::BOOL(0);
    unsafe {
        windows::Win32::Graphics::Dwm::DwmGetColorizationColor(&mut colorization, &mut opaqueblend)
            .unwrap();
    };

    let argb = hex::decode(format!("{:X}", colorization)).unwrap();
    let rgb = [argb[1], argb[2], argb[3]];
    let rgb_string = hex::encode(rgb);

    return format!("#{}", rgb_string).to_string();
}

#[tauri::command]
pub fn clipboard_text(text_extractor: tauri::State<TextExtractor>) -> String {
    text_extractor.text_from_clipboard()
}

#[tauri::command]
pub fn settings(settings_manager: tauri::State<SettingsManager>) -> Settings {
    settings_manager.read_settings()
}

#[tauri::command]
pub fn default_settings(app: AppHandle) -> Settings {
    SettingsManager::read_default_settings(&app)
}

#[tauri::command]
pub fn reset_settings_to_default(settings_manager: tauri::State<SettingsManager>) {
    settings_manager.reset_to_default();
}

#[tauri::command]
pub fn update_settings(
    settings_manager: tauri::State<SettingsManager>,
    updated_settings: PartialSettings,
) {
    log::info!(
        "Received settings from the frontend. Updating settings: {:#?}",
        updated_settings
    );
    settings_manager.update_settings(updated_settings);
}
