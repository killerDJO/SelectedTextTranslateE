use reqwest::header::{CONTENT_TYPE, ORIGIN, USER_AGENT};
use tauri::{AppHandle, Manager};

use crate::settings::SettingsManager;

pub async fn execute_google_translate_request(
    app: &AppHandle,
    url: String,
    body: String,
    user_agent: String,
) -> Result<String, Box<dyn std::error::Error>> {
    let settings_manager = app.state::<SettingsManager>();
    let settings = settings_manager.read_settings();

    let mut client_builder = reqwest::Client::builder();

    if let Some(proxy) = settings.core.proxy {
        client_builder = client_builder.proxy(reqwest::Proxy::https(proxy)?)
    }

    let response = client_builder
        .build()?
        .post(url)
        .body(body)
        .header(USER_AGENT, user_agent)
        .header(ORIGIN, "https://translate.google.com")
        .header(
            CONTENT_TYPE,
            "application/x-www-form-urlencoded;charset=UTF-8",
        )
        .send()
        .await?;

    Ok(response.text().await?)
}
