import { StoreOptions } from "vuex";
import { MessageBus } from "framework/MessageBus";
import { Messages } from "common/messaging/Messages";
import { app } from "components/App/App.store";

export interface RootState {
}

export const root: StoreOptions<RootState> = {
    state: {},
    modules: {
        app
    }
};