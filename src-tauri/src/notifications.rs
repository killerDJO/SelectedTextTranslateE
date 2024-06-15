use log::{error, warn};
use tauri::AppHandle;
use tauri_plugin_notification::{NotificationExt, PermissionState};

pub fn show_error_notification(
    app: &AppHandle,
    err: Box<dyn std::error::Error>,
    title: impl Into<String>,
) {
    let title_str = title.into();
    error!("Non critical error: [{}]. Details: {}.", title_str, err,);

    show_notification(app, title_str);
}

pub fn show_notification(app: &AppHandle, title: impl Into<String>) {
    let title_str = title.into();

    if !ensure_notifications_permissions(app) {
        return;
    }

    let notification_result = app
        .notification()
        .builder()
        .title(title_str)
        .body("Details can be found in logs")
        .show();

    if notification_result.is_err() {
        warn!(
            "Error sending notification. {:?}",
            notification_result.err()
        );
    }
}

fn ensure_notifications_permissions(app: &AppHandle) -> bool {
    let permission_state_result = app.notification().permission_state();

    if permission_state_result.is_err() {
        error!(
            "Error getting notification permission state. {:?}",
            permission_state_result.err()
        );
        return false;
    }

    let permission_state = permission_state_result.unwrap();

    if permission_state == PermissionState::Denied {
        return false;
    }

    if permission_state != PermissionState::Granted {
        let request_permission_state_result = app.notification().request_permission();

        if request_permission_state_result.is_err() {
            error!(
                "Error requesting notification permission state. {:?}",
                request_permission_state_result.err()
            );
            return false;
        }

        let request_permission_state = request_permission_state_result.unwrap();
        if request_permission_state == PermissionState::Denied {
            return false;
        }

        if request_permission_state != PermissionState::Granted {
            warn!("Unknown permission state from notification request. Notifications are skipped.");
            return false;
        }
    }

    return true;
}
