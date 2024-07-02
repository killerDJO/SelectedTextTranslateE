use std::{error::Error, mem::size_of, sync::Mutex, thread, time::Duration};
use tauri::{AppHandle, Manager};
use tauri_plugin_clipboard_manager::ClipboardExt;
use windows::Win32::UI::Input::KeyboardAndMouse::{
    MapVirtualKeyW, SendInput, INPUT, INPUT_0, INPUT_KEYBOARD, KEYBDINPUT, KEYBD_EVENT_FLAGS,
    KEYEVENTF_KEYUP, MAPVK_VK_TO_VSC, VIRTUAL_KEY, VK_C, VK_CONTROL,
};

use crate::{notifications::show_error_notification, settings::SettingsManager};

pub struct TextExtractor {
    app: AppHandle,
    text_from_clipboard: Mutex<String>,
}

impl TextExtractor {
    pub fn new(app: &AppHandle) -> Self {
        Self {
            app: app.clone(),
            text_from_clipboard: Mutex::new(String::new()),
        }
    }

    pub fn text_from_clipboard(&self) -> String {
        self.text_from_clipboard.lock().unwrap().clone()
    }

    pub fn copy_selected_text(&self) {
        let result = Self::broadcast_copy_command();
        if let Err(err) = result {
            show_error_notification(&self.app, err, "Error copying text");
            return;
        }

        let settings = self.app.state::<SettingsManager>().read_settings();
        thread::sleep(Duration::from_millis(settings.core.copy_delay_milliseconds));

        self.extract_text_from_clipboard();
    }

    pub fn extract_text_from_clipboard(&self) {
        let content = self.app.clipboard().read_text();

        let text = content.unwrap_or(String::new());

        let mut text_from_clipboard = self.text_from_clipboard.lock().unwrap();
        *text_from_clipboard = text;
    }

    fn broadcast_copy_command() -> Result<(), Box<dyn Error>> {
        const CBSIZE: i32 = size_of::<INPUT>() as i32;

        // Initialize inputs vector with default settings, to reduce boilerplate
        // Actual keys are set below
        let mut inputs: Vec<INPUT> = vec![];
        for _ in 0..4 {
            let input = INPUT {
                r#type: INPUT_KEYBOARD,
                Anonymous: INPUT_0 {
                    ki: KEYBDINPUT {
                        wVk: VIRTUAL_KEY(0),
                        wScan: 0,
                        dwFlags: KEYBD_EVENT_FLAGS(0),
                        time: 0,
                        dwExtraInfo: 0,
                    },
                },
            };

            inputs.push(input);
        }

        unsafe {
            // Ctrl + C combination
            // Ctrl down
            inputs[0].Anonymous.ki.wVk = VK_CONTROL;
            inputs[0].Anonymous.ki.wScan =
                MapVirtualKeyW(VK_CONTROL.0 as u32, MAPVK_VK_TO_VSC) as u16;
            // C down
            inputs[1].Anonymous.ki.wVk = VK_C;
            inputs[1].Anonymous.ki.wScan = MapVirtualKeyW(VK_C.0 as u32, MAPVK_VK_TO_VSC) as u16;
            // Ctrl up
            inputs[2].Anonymous.ki.dwFlags = KEYEVENTF_KEYUP;
            inputs[2].Anonymous.ki.wVk = inputs[0].Anonymous.ki.wVk;
            inputs[2].Anonymous.ki.wScan = inputs[0].Anonymous.ki.wScan;
            // C up
            inputs[3].Anonymous.ki.dwFlags = KEYEVENTF_KEYUP;
            inputs[3].Anonymous.ki.wVk = inputs[1].Anonymous.ki.wVk;
            inputs[3].Anonymous.ki.wScan = inputs[1].Anonymous.ki.wScan;

            let result = SendInput(&mut inputs, CBSIZE);

            if result == 0 {
                return Err("Error executing SendInput".into());
            }
        };

        Ok(())
    }
}
