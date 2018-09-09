import { StoreOptions } from "vuex";

import { app } from "components/App/App.store";

// tslint:disable-next-line:no-empty-interface
export interface RootState {
}

export const root: StoreOptions<RootState> = {
    state: {},
    modules: {
        app
    }
};