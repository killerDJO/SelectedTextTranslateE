use std::error::Error;

use tauri::{
    image::Image,
    menu::{CheckMenuItem, Menu, MenuBuilder, MenuEvent, MenuItemBuilder, Submenu, SubmenuBuilder},
    tray::{MouseButton, TrayIcon, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, Wry,
};
use tauri_plugin_shell::ShellExt;

use crate::{
    events_manager::{EventsManager, PLAY_START_EVENT, PLAY_STOP_EVENT},
    notifications::show_error_notification,
    settings::{PartialSettings, PartialTranslationSettings, SettingsManager, Tag},
    shortcuts_manager::ShortcutsManager,
    text_extractor::TextExtractor,
    window_manager,
};

const TRANSLATE_MENU_ITEM_ID: &str = "translate";
const HISTORY_MENU_ITEM_ID: &str = "history";
const SETTINGS_MENU_ITEM_ID: &str = "settings";
const LOGS_MENU_ITEM_ID: &str = "logs";
const TAGS_MENU_ITEM_ID_PREFIX: &str = "tags:";
const TOGGLE_SUSPEND_MENU_ITEM_ID: &str = "toggle_suspend";
const ABOUT_MENU_ITEM_ID: &str = "about";
const EXIT_MENU_ITEM_ID: &str = "exit";

#[derive(Clone)]
pub struct AppTrayIcon {
    tray_icon: TrayIcon,
}

impl AppTrayIcon {
    pub fn new(app: &AppHandle) -> Self {
        let shortcuts_manager = app.state::<ShortcutsManager>();
        let settings_manager = app.state::<SettingsManager>();
        let menu = Self::build_menu(app, shortcuts_manager.is_suspended());

        let tray_icon = TrayIconBuilder::new()
            .menu(&menu)
            .icon(Self::get_tray_icon_image(shortcuts_manager.is_suspended()))
            .tooltip("Selected text translate..")
            .on_menu_event(Self::menu_event_handler)
            .on_tray_icon_event(Self::tray_icon_event_handler)
            .build(app)
            .unwrap();

        let app_tray_icon = Self { tray_icon };

        let self_clone = app_tray_icon.clone();
        shortcuts_manager.add_change_handler(move |suspended: bool| {
            self_clone.handle_suspended_state_change(suspended);
        });

        let self_clone = app_tray_icon.clone();
        settings_manager.add_change_handler(move |old_settings, new_settings| {
            if old_settings.translation.tags != new_settings.translation.tags {
                self_clone.update_menu();
            }
        });

        Self::watch_playing_state_change(&app_tray_icon.tray_icon);

        app_tray_icon
    }

    fn menu_event_handler(app: &AppHandle, event: MenuEvent) {
        match event.id().as_ref() {
            TRANSLATE_MENU_ITEM_ID => {
                Self::translate_from_clipboard(app);
            }
            HISTORY_MENU_ITEM_ID => {
                window_manager::show_history_window(app);
            }
            SETTINGS_MENU_ITEM_ID => {
                window_manager::show_settings_window(app);
            }
            TOGGLE_SUSPEND_MENU_ITEM_ID => {
                let shortcuts_manager = app.state::<ShortcutsManager>();
                shortcuts_manager.toggle_suspend();
            }
            ABOUT_MENU_ITEM_ID => {
                window_manager::show_about_window(app);
            }
            LOGS_MENU_ITEM_ID => Self::open_logs_folder(app)
                .unwrap_or_else(|e| show_error_notification(app, e, "Error opening logs folder.")),
            EXIT_MENU_ITEM_ID => std::process::exit(0),
            id => {
                if id.starts_with(TAGS_MENU_ITEM_ID_PREFIX) {
                    Self::toggle_tag(app, id.replace(TAGS_MENU_ITEM_ID_PREFIX, ""));
                }
            }
        }
    }

    fn tray_icon_event_handler(tray: &TrayIcon, event: TrayIconEvent) {
        match event {
            TrayIconEvent::Click { button, .. } if button == MouseButton::Left => {
                Self::translate_from_clipboard(tray.app_handle());
            }
            _ => {}
        }
    }

    fn translate_from_clipboard(app: &AppHandle) {
        app.state::<TextExtractor>().extract_text_from_clipboard();
        let window = window_manager::show_translation_window(app);
        app.state::<EventsManager>()
            .emit_translate_text_command(&window, false);
    }

    fn handle_suspended_state_change(&self, suspended: bool) {
        self.tray_icon
            .set_icon(Some(Self::get_tray_icon_image(suspended)))
            .unwrap();
        self.tray_icon
            .set_menu(Some(Self::build_menu(
                self.tray_icon.app_handle(),
                suspended,
            )))
            .unwrap();
    }

    fn update_menu(&self) {
        let shortcuts_manager = self.tray_icon.app_handle().state::<ShortcutsManager>();

        self.tray_icon
            .set_menu(Some(Self::build_menu(
                self.tray_icon.app_handle(),
                shortcuts_manager.is_suspended(),
            )))
            .unwrap();
    }

    fn toggle_tag(app: &AppHandle, toggled_tag: String) {
        let settings_manager = app.state::<SettingsManager>();
        let mut tags = settings_manager.read_settings().translation.tags;

        for tag in &mut tags {
            if tag.tag == toggled_tag {
                *tag = Tag {
                    tag: tag.tag.clone(),
                    enabled: !tag.enabled,
                }
            }
        }

        settings_manager.update_settings(PartialSettings {
            translation: Some(PartialTranslationSettings {
                tags: Some(tags),
                ..Default::default()
            }),
            ..Default::default()
        })
    }

    fn watch_playing_state_change(tray_icon: &TrayIcon) {
        let app = tray_icon.app_handle();

        let tray_icon_clone = tray_icon.clone();
        app.listen(PLAY_START_EVENT, move |_| {
            let playing_icon = Image::from_path("./icons/tray-playing.ico").unwrap();
            tray_icon_clone.set_icon(Some(playing_icon)).unwrap();
        });

        let tray_icon_clone = tray_icon.clone();
        app.listen(PLAY_STOP_EVENT, move |_| {
            let shortcuts_manager = tray_icon_clone.app_handle().state::<ShortcutsManager>();
            let regular_icon = Self::get_tray_icon_image(shortcuts_manager.is_suspended());
            tray_icon_clone.set_icon(Some(regular_icon)).unwrap();
        });
    }

    fn build_menu(app: &AppHandle, suspended: bool) -> Menu<Wry> {
        let translate_item =
            MenuItemBuilder::with_id(TRANSLATE_MENU_ITEM_ID, "Translate from clipboard")
                .build(app)
                .unwrap();
        let history_item = MenuItemBuilder::with_id(HISTORY_MENU_ITEM_ID, "History")
            .build(app)
            .unwrap();
        let settings_item = MenuItemBuilder::with_id(SETTINGS_MENU_ITEM_ID, "Settings")
            .build(app)
            .unwrap();
        let toggle_suspend_item = MenuItemBuilder::with_id(
            TOGGLE_SUSPEND_MENU_ITEM_ID,
            if suspended { "Enable" } else { "Suspend" },
        )
        .build(app)
        .unwrap();
        let about_item = MenuItemBuilder::with_id(ABOUT_MENU_ITEM_ID, "About")
            .build(app)
            .unwrap();
        let logs_item = MenuItemBuilder::with_id(LOGS_MENU_ITEM_ID, "Logs")
            .build(app)
            .unwrap();
        let exit_item = MenuItemBuilder::with_id(EXIT_MENU_ITEM_ID, "Quit")
            .build(app)
            .unwrap();

        let tags_submenu = Self::build_tags_submenu(app);

        let menu = MenuBuilder::new(app)
            .item(&translate_item)
            .item(&history_item)
            .item(&settings_item)
            .separator()
            .item(&tags_submenu)
            .item(&toggle_suspend_item)
            .separator()
            .item(&about_item)
            .item(&logs_item)
            .item(&exit_item)
            .build()
            .unwrap();

        menu
    }

    fn build_tags_submenu(app: &AppHandle) -> Submenu<Wry> {
        let settings = app.state::<SettingsManager>().read_settings();
        let tags = settings.translation.tags;

        let mut tags_submenu = SubmenuBuilder::new(app, "Tags");

        if tags.len() > 0 {
            for tag in tags {
                let check_menu_item = CheckMenuItem::with_id(
                    app,
                    format!("{TAGS_MENU_ITEM_ID_PREFIX}{}", tag.tag),
                    tag.tag,
                    true,
                    tag.enabled,
                    None::<&str>,
                )
                .unwrap();
                tags_submenu = tags_submenu.item(&check_menu_item);
            }
        } else {
            tags_submenu = tags_submenu.enabled(false);
        }

        let tags_submenu = tags_submenu.build().unwrap();
        tags_submenu
    }

    fn get_tray_icon_image(is_suspended: bool) -> Image<'static> {
        let icon = if is_suspended {
            Image::from_path("./icons/tray-suspended.ico").unwrap()
        } else {
            Image::from_path("./icons/tray.ico").unwrap()
        };
        icon
    }

    fn open_logs_folder(app: &AppHandle) -> Result<(), Box<dyn Error>> {
        let logs_folder = app.path().app_log_dir()?;
        app.shell().open(logs_folder.to_str().unwrap(), None)?;
        Ok(())
    }
}
