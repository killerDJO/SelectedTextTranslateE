import { StoreOptions } from "vuex";
import { app } from "components/App/App.store";

export interface RootState {
}

export const root: StoreOptions<RootState> = {
    state: {},
    modules: {
        app
    }
};