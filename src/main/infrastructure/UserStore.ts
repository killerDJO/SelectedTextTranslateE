import { injectable } from "inversify";
import { SettingsStore } from "infrastructure/SettingsStore";

import { UserInfo } from "common/dto/UserInfo";

@injectable()
export class UserStore {
    constructor(private readonly settingsStore: SettingsStore) {
    }

    public setCurrentUser(userInfo: UserInfo): void {
        this.settingsStore.updateSettings({
            user: {
                email: userInfo.email.toLowerCase(),
                password: userInfo.password
            }
        });
    }

    public getCurrentUser(): UserInfo | null {
        if (!this.settingsStore.get("user.email")) {
            return null;
        }

        return {
            email: this.settingsStore.get("user.email"),
            password: this.settingsStore.get("user.password")
        };
    }

    public clearCurrentUser(): void {
        this.settingsStore.updateSettings({
            user: {
                email: null,
                password: null,
            }
        });
    }
}