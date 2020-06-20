import { Module } from "vuex";

import { RootState } from "root.store";

import { ApplicationInfo } from "common/dto/about/ApplicationInfo";
import { Messages } from "common/messaging/Messages";

import { MessageBus } from "common/renderer/MessageBus";

const messageBus = new MessageBus();

interface AboutState {
    info: ApplicationInfo | null;
}

export const about: Module<AboutState, RootState> = {
    namespaced: true,
    state: {
        info: null
    },
    mutations: {
        setApplicationInfo(state: AboutState, info: ApplicationInfo): void {
            state.info = info;
        },
    },
    actions: {
        setup(context): void {
            messageBus.observeValue<ApplicationInfo>(Messages.About.ApplicationInfo, info => context.commit("setApplicationInfo", info));
        },
        checkForUpdates(): void {
            messageBus.sendCommand(Messages.About.CheckForUpdates);
        }
    }
};