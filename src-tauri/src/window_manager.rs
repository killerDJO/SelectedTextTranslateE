use std::ffi::c_void;

use tauri::{AppHandle, Manager, WebviewWindow};
use windows::Win32::{
    Foundation::RECT,
    UI::WindowsAndMessaging::{SPI_GETWORKAREA, SYSTEM_PARAMETERS_INFO_UPDATE_FLAGS},
};

use crate::{
    events_manager::EventsManager,
    settings::{
        PartialSettings, PartialTranslationWindowSettings, SettingsManager,
        TranslationWindowSettings, WindowSettings,
    },
};

pub const TRANSLATION_WINDOW_LABEL: &str = "translation";
pub const HISTORY_WINDOW_LABEL: &str = "history";
pub const SETTINGS_WINDOW_LABEL: &str = "settings";
pub const ABOUT_WINDOW_LABEL: &str = "about";

pub const WEB_VIEW_PATH: &str = "index.html";

struct SizeAndPosition {
    width: f64,
    height: f64,
    x: f64,
    y: f64,
}

pub fn get_or_create_translation_window(
    app: &AppHandle,
    initially_hidden: bool,
) -> (WebviewWindow, bool) {
    let settings_manager = app.state::<SettingsManager>();

    let settings = settings_manager.read_settings();
    let window_settings = settings.translation_window;

    let exiting_window = app.get_webview_window(TRANSLATION_WINDOW_LABEL);
    let is_window_created = exiting_window.is_none();
    let translate_window = exiting_window.unwrap_or_else(|| {
        let (x, y) = get_translation_window_position(app, &window_settings);

        let window = tauri::WebviewWindowBuilder::new(
            app,
            TRANSLATION_WINDOW_LABEL,
            get_window_url(TRANSLATION_WINDOW_LABEL, initially_hidden),
        )
        .title("Selected Text Translate")
        .skip_taskbar(true)
        .always_on_top(true)
        .visible(false) // Important to hide the window initially, otherwise focus won't work
        .decorations(false)
        .focused(true)
        .resizable(true)
        .fullscreen(false)
        .shadow(false)
        .inner_size(window_settings.width as f64, window_settings.height as f64)
        .min_inner_size(
            window_settings.min_width as f64,
            window_settings.min_height as f64,
        )
        .position(x, y)
        .build()
        .unwrap();

        handle_translate_window_events(&window);

        window
    });

    (translate_window, is_window_created)
}

pub fn show_translation_window(app: &AppHandle) -> WebviewWindow {
    let (translate_win, is_window_created) = get_or_create_translation_window(app, false);

    // Emit the event before show to ensure loader is shown
    // This prevents flashes of the window content
    EventsManager::emit_before_show_event(&translate_win);

    // Upon initial creation, window will show itself upon load
    if !is_window_created {
        translate_win.show().unwrap();
        translate_win.set_focus().unwrap();
    }

    translate_win
}

pub fn show_history_window(app: &AppHandle) -> WebviewWindow {
    let settings_manager = app.state::<SettingsManager>();
    let settings = settings_manager.read_settings();

    show_standard_window(
        app,
        settings.history_window,
        "History",
        HISTORY_WINDOW_LABEL,
    )
}

pub fn show_settings_window(app: &AppHandle) -> WebviewWindow {
    let settings_manager = app.state::<SettingsManager>();
    let settings = settings_manager.read_settings();

    show_standard_window(
        app,
        settings.settings_window,
        "Settings",
        SETTINGS_WINDOW_LABEL,
    )
}

pub fn show_about_window(app: &AppHandle) -> WebviewWindow {
    let about_window = app
        .get_webview_window(ABOUT_WINDOW_LABEL)
        .unwrap_or_else(|| {
            let width = 500.0;
            let height = 150.0;
            let (x, y) = get_central_position(app, width, height);

            tauri::WebviewWindowBuilder::new(
                app,
                ABOUT_WINDOW_LABEL,
                get_window_url(ABOUT_WINDOW_LABEL, false),
            )
            .title("About")
            .resizable(false)
            .fullscreen(false)
            .maximizable(false)
            .minimizable(false)
            .inner_size(width, height)
            .position(x, y)
            .build()
            .unwrap()
        });

    about_window.show().unwrap();
    about_window.set_focus().unwrap();

    about_window
}

fn show_standard_window(
    app: &AppHandle,
    window_settings: WindowSettings,
    title: &str,
    label: &str,
) -> WebviewWindow {
    let existing_window = app.get_webview_window(label);
    let is_window_created = existing_window.is_none();

    let window = existing_window.unwrap_or_else(|| {
        let size_and_position = get_window_size_and_position_from_percentage(
            app,
            window_settings.width_percentage,
            window_settings.height_percentage,
        );

        tauri::WebviewWindowBuilder::new(app, label, get_window_url(label, false))
            .title(title)
            .inner_size(size_and_position.width, size_and_position.height)
            .min_inner_size(
                window_settings.min_width as f64,
                window_settings.min_height as f64,
            )
            .position(size_and_position.x, size_and_position.y)
            .visible(false)
            .build()
            .unwrap()
    });

    // Upon initial creation, window will show itself upon load
    if !is_window_created {
        window.show().unwrap();
        window.set_focus().unwrap();
    }

    if window.is_minimized().unwrap() {
        window.unminimize().unwrap();
    }

    window
}

fn get_window_url(view_name: &str, initially_hidden: bool) -> tauri::WebviewUrl {
    tauri::WebviewUrl::App(
        format!("{WEB_VIEW_PATH}?initially_hidden={initially_hidden}#{view_name}").into(),
    )
}

fn handle_translate_window_events(translate_window: &WebviewWindow) {
    let window = translate_window.clone();

    translate_window.on_window_event(move |event| {
        let app = window.app_handle();
        let settings_manager = app.state::<SettingsManager>();

        match event {
            tauri::WindowEvent::Focused(is_focused) => {
                // On resize, the focus lost/gained events are triggered in a quick succession
                // This check prevents the window from hiding when it's resized
                let is_actually_focused: bool = window.is_focused().unwrap();
                if !is_focused && !is_actually_focused {
                    window.hide().unwrap();
                    // Show loader for next time, to prevent flashing of old content
                    EventsManager::emit_before_show_event(&window);
                }
            }
            tauri::WindowEvent::Resized(size) => update_translation_window_settings(
                &settings_manager,
                PartialTranslationWindowSettings {
                    width: Some(size.width),
                    height: Some(size.height),
                    ..Default::default()
                },
            ),
            tauri::WindowEvent::Moved(position) => update_translation_window_settings(
                &settings_manager,
                PartialTranslationWindowSettings {
                    x: Some(Some(position.x)),
                    y: Some(Some(position.y)),
                    ..Default::default()
                },
            ),
            _ => {}
        }
    });
}

fn update_translation_window_settings(
    settings_manager: &SettingsManager,
    updated_settings: PartialTranslationWindowSettings,
) {
    settings_manager.update_settings(PartialSettings {
        translation_window: Some(updated_settings),
        ..Default::default()
    });
}

fn get_window_size_and_position_from_percentage(
    app: &AppHandle,
    width_percentage: u8,
    hight_percentage: u8,
) -> SizeAndPosition {
    let primary_window = app.primary_monitor().unwrap().unwrap();
    let primary_window_size = primary_window.size();
    let window_with = primary_window_size.width as f64;
    let window_height = primary_window_size.height as f64;

    let width = (window_with * width_percentage as f64) / 100.0;
    let height = (window_height * hight_percentage as f64) / 100.0;
    let (x, y) = get_central_position(app, width, height);

    SizeAndPosition {
        width,
        height,
        x,
        y,
    }
}

fn get_central_position(app: &AppHandle, width: f64, height: f64) -> (f64, f64) {
    let primary_window = app.primary_monitor().unwrap().unwrap();
    let primary_window_size = primary_window.size();

    let x = primary_window_size.width as f64 / 2.0 - width / 2.0;
    let y = primary_window_size.height as f64 / 2.0 - height / 2.0;

    (x as f64, y as f64)
}

fn get_translation_window_position(
    app: &AppHandle,
    settings: &TranslationWindowSettings,
) -> (f64, f64) {
    let work_area = get_primary_monitor_work_area();

    if is_saved_window_position_valid(app, settings) {
        return (settings.x.unwrap() as f64, settings.y.unwrap() as f64);
    }

    let width = settings.width;
    let height = settings.height;

    let x = work_area.right - width as i32 - settings.margin as i32;
    let y = work_area.bottom - height as i32 - settings.margin as i32;

    (x as f64, y as f64)
}

fn is_saved_window_position_valid(app: &AppHandle, settings: &TranslationWindowSettings) -> bool {
    // Check settings are configured configured
    if settings.x.is_none() || settings.y.is_none() {
        return false;
    }

    let x = settings.x.unwrap();
    let y = settings.y.unwrap();
    let height = settings.height as i32;
    let width = settings.width as i32;

    let all_monitors = app.available_monitors().unwrap();
    for monitor in all_monitors {
        let monitor_size = monitor.size();
        let monitor_position = monitor.position();

        let is_window_fits_on_display = x > monitor_position.x
            && x + width < monitor_position.x + monitor_size.width as i32
            && y > monitor_position.y
            && y + height < monitor_position.y + monitor_size.height as i32;

        if is_window_fits_on_display {
            return true;
        }
    }

    return false;
}

fn get_primary_monitor_work_area() -> RECT {
    let rect: RECT = RECT::default();
    unsafe {
        windows::Win32::UI::WindowsAndMessaging::SystemParametersInfoA(
            SPI_GETWORKAREA,
            0,
            Some(std::ptr::addr_of!(rect) as *mut c_void),
            SYSTEM_PARAMETERS_INFO_UPDATE_FLAGS(0),
        )
        .unwrap();
    };

    rect
}
