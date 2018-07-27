import Store = require("electron-store");
import { injectable } from "inversify";

@injectable()
export class SettingsStore {
    private readonly store: Store = new Store();

    public get<TValue>(name: string): TValue {
        return this.store.get(name);
    }

    public getOrSetDefault<TValue>(name: string, defaultValue: TValue): TValue {
        if (!this.store.has(name)) {
            this.set(name, defaultValue);
            return defaultValue;
        }

        return this.store.get(name);
    }

    public setAll(settings: {}) {
        this.store.set(settings);
    }

    public set<TValue>(name: string, value: TValue) {
        this.store.set(name, value);
    }
}