use std::{
    sync::{Arc, Mutex},
    time::Duration,
};
use tauri::AppHandle;
use tokio::time;

use crate::events_manager::EventsManager;

#[derive(Clone)]
pub struct AccentColorProvider {
    app: AppHandle,
    accent_color: Arc<Mutex<String>>,
}

impl AccentColorProvider {
    pub fn new(app: &AppHandle) -> Self {
        let accent_color_provider = Self {
            app: app.clone(),
            accent_color: Arc::new(Mutex::new(Self::fetch_accent_color())),
        };

        // Since Tauri doesn't provide an api to watch for accent color changes,
        // we have to poll for it every few seconds, and compare with stored value
        accent_color_provider.spawn_watch_task();

        accent_color_provider
    }

    pub fn accent_color(&self) -> String {
        self.accent_color.lock().unwrap().clone()
    }

    pub fn fetch_accent_color() -> String {
        let mut colorization: u32 = 0;
        let mut opaqueblend = windows::Win32::Foundation::BOOL(0);
        unsafe {
            windows::Win32::Graphics::Dwm::DwmGetColorizationColor(
                &mut colorization,
                &mut opaqueblend,
            )
            .unwrap();
        };

        let argb = hex::decode(format!("{:X}", colorization)).unwrap();
        let rgb = [argb[1], argb[2], argb[3]];
        let rgb_string = hex::encode(rgb);

        return format!("#{}", rgb_string).to_string();
    }

    fn spawn_watch_task(&self) {
        let self_clone = self.clone();
        let app_clone = self.app.clone();
        tauri::async_runtime::spawn(async move {
            let mut interval = time::interval(Duration::from_secs(5));

            loop {
                interval.tick().await;
                let accent_color = Self::fetch_accent_color();
                let mut current_accent_color = self_clone.accent_color.lock().unwrap();

                let is_accent_color_changed = *current_accent_color != accent_color;

                if is_accent_color_changed {
                    *current_accent_color = accent_color.clone();

                    EventsManager::emit_accent_color_changed_event(&app_clone, accent_color);
                }
            }
        });
    }
}
