import { Container } from "inversify";

import { StorageFolderProvider } from "infrastructure/StorageFolderProvider";
import { Logger } from "infrastructure/Logger";
import { ErrorHandler } from "infrastructure/ErrorHandler";
import { SettingsStore } from "infrastructure/SettingsStore";
import { NotificationSender } from "infrastructure/NotificationSender";
import { ServiceRendererProvider } from "infrastructure/ServiceRendererProvider";
import { UserStore } from "infrastructure/UserStore";

import { Installer } from "install/Installer";
import { Updater } from "install/Updater";
import { StartupHandler } from "install/StartupHandler";
import { StartupItemsProvider } from "install/StartupItemsProvider";

import { RequestProvider } from "data-access/RequestProvider";
import { DatastoreProvider } from "data-access/DatastoreProvider";

import { HashProvider } from "business-logic/translation/HashProvider";
import { TextExtractor } from "business-logic/translation/TextExtractor";
import { TextTranslator } from "business-logic/translation/TextTranslator";
import { TranslatePageParser } from "business-logic/translation/TranslatePageParser";
import { TranslationResponseParser } from "business-logic/translation/TranslationResponseParser";
import { TextPlayer } from "business-logic/translation/TextPlayer";

import { SettingsProvider } from "business-logic/settings/SettingsProvider";

import { SearchExecutor } from "business-logic/search/SearchExecutor";

import { HistorySyncService } from "business-logic/history/sync/HistorySyncService";
import { HistoryMigration } from "business-logic/history/persistence/migrations/base/HistoryMigration";
import { HistoryDatabaseProvider } from "business-logic/history/persistence/HistoryDatabaseProvider";
import { RecordIdGenerator } from "business-logic/history/RecordIdGenerator";
import { AccountHandler } from "business-logic/history/sync/AccountHandler";
import { HistoryMigrator } from "business-logic/history/persistence/HistoryMigrator";
import { HistoryBackuper } from "business-logic/history/persistence/HistoryBackuper";
import { HistoryStore } from "business-logic/history/HistoryStore";
import { HistoryQueryExecutor } from "business-logic/history/HistoryQueryExecutor";
import { TagsEngine } from "business-logic/history/TagsEngine";

import { AddUniqueIdConstraint } from "business-logic/history/persistence/migrations/1_AddUniqueIdConstraint";
import { AddIdentifierMigration } from "business-logic/history/persistence/migrations/2_AddIdentifierMigration";
import { RemoveDuplicatedRecordsMigration } from "business-logic/history/persistence/migrations/3_RemoveDuplicatedRecordsMigration";
import { AddLastModificationTimeMigration } from "business-logic/history/persistence/migrations/4_AddLastModificationTimeMigration";
import { MigrateDatesToNumbers } from "business-logic/history/persistence/migrations/5_MigrateDatesToNumbers";

import { MessageBus } from "infrastructure/MessageBus";
import { RendererLocationProvider } from "presentation/infrastructure/RendererLocationProvider";
import { Application } from "presentation/Application";
import { AccentColorProvider } from "presentation/framework/AccentColorProvider";
import { HotkeysRegistry } from "presentation/hotkeys/HotkeysRegistry";
import { Scaler } from "presentation/framework/scaling/Scaler";
import { ViewContext } from "presentation/framework/ViewContext";
import { RendererErrorHandler } from "presentation/infrastructure/RendererErrorHandler";
import { IconsProvider } from "presentation/infrastructure/IconsProvider";
import { ViewsRegistry } from "presentation/views/ViewsRegistry";
import { NullScaler } from "presentation/framework/scaling/NullScaler";
import { ScalerFactory } from "presentation/framework/scaling/ScalerFactory";

class Binder {
    public readonly container: Container = new Container({ skipBaseClassChecks: true });

    constructor() {
        this.bindInfrastructure();
        this.bindInstall();
        this.bindDataAccess();
        this.bindBusinessLogic();
        this.bindPresentation();

        this.container.bind<Application>(Application).toSelf();
    }

    private bindInfrastructure(): void {
        this.container.bind<StorageFolderProvider>(StorageFolderProvider).toSelf();
        this.container.bind<ServiceRendererProvider>(ServiceRendererProvider).toSelf().inSingletonScope();
        this.container.bind<NotificationSender>(NotificationSender).toSelf();
        this.container.bind<Logger>(Logger).toSelf().inSingletonScope();
        this.container.bind<ErrorHandler>(ErrorHandler).toSelf().inSingletonScope();
        this.container.bind<SettingsStore>(SettingsStore).toSelf().inSingletonScope();
        this.container.bind<UserStore>(UserStore).toSelf().inSingletonScope();
    }

    private bindInstall(): void {
        this.container.bind<Installer>(Installer).toSelf().inSingletonScope();
        this.container.bind<Updater>(Updater).toSelf().inSingletonScope();
        this.container.bind<StartupHandler>(StartupHandler).toSelf().inSingletonScope();
        this.container.bind<StartupItemsProvider>(StartupItemsProvider).toSelf().inSingletonScope();
    }

    private bindDataAccess(): void {
        this.container.bind<RequestProvider>(RequestProvider).toSelf();
        this.container.bind<DatastoreProvider>(DatastoreProvider).toSelf();
    }

    private bindBusinessLogic(): void {
        this.container.bind<SettingsProvider>(SettingsProvider).toSelf().inSingletonScope();
        this.container.bind<SearchExecutor>(SearchExecutor).toSelf().inSingletonScope();

        this.bindHistory();
        this.bindTranslationEngine();
    }

    private bindHistory(): void {
        this.container.bind<HistoryStore>(HistoryStore).toSelf().inSingletonScope();
        this.container.bind<HistoryQueryExecutor>(HistoryQueryExecutor).toSelf().inSingletonScope();
        this.container.bind<HistorySyncService>(HistorySyncService).toSelf().inSingletonScope();
        this.container.bind<AccountHandler>(AccountHandler).toSelf().inSingletonScope();
        this.container.bind<HistoryDatabaseProvider>(HistoryDatabaseProvider).toSelf().inSingletonScope();
        this.container.bind<HistoryMigrator>(HistoryMigrator).toSelf().inSingletonScope();
        this.container.bind<HistoryBackuper>(HistoryBackuper).toSelf().inSingletonScope();
        this.container.bind<RecordIdGenerator>(RecordIdGenerator).toSelf();

        this.container.bind<HistoryMigration>(HistoryMigration).to(AddLastModificationTimeMigration);
        this.container.bind<HistoryMigration>(HistoryMigration).to(AddIdentifierMigration);
        this.container.bind<HistoryMigration>(HistoryMigration).to(RemoveDuplicatedRecordsMigration);
        this.container.bind<HistoryMigration>(HistoryMigration).to(AddUniqueIdConstraint);
        this.container.bind<HistoryMigration>(HistoryMigration).to(MigrateDatesToNumbers);

        this.container.bind<TagsEngine>(TagsEngine).toSelf();
    }

    private bindTranslationEngine(): void {
        this.container.bind<HashProvider>(HashProvider).toSelf();
        this.container.bind<TextExtractor>(TextExtractor).toSelf();
        this.container.bind<TextTranslator>(TextTranslator).toSelf();
        this.container.bind<TranslatePageParser>(TranslatePageParser).toSelf().inSingletonScope();
        this.container.bind<TranslationResponseParser>(TranslationResponseParser).toSelf();
        this.container.bind<TextPlayer>(TextPlayer).toSelf();
    }

    private bindPresentation(): void {
        this.container.bind<AccentColorProvider>(AccentColorProvider).toSelf().inSingletonScope();
        this.container.bind<MessageBus>(MessageBus).toSelf().inSingletonScope();
        this.container.bind<RendererLocationProvider>(RendererLocationProvider).toSelf();
        this.container.bind<ViewContext>(ViewContext).toSelf();
        this.container.bind<HotkeysRegistry>(HotkeysRegistry).toSelf().inSingletonScope();
        this.container.bind<Scaler>(Scaler).toSelf().inSingletonScope();
        this.container.bind<NullScaler>(NullScaler).toSelf().inSingletonScope();
        this.container.bind<ScalerFactory>(ScalerFactory).toSelf();
        this.container.bind<RendererErrorHandler>(RendererErrorHandler).toSelf().inSingletonScope();
        this.container.bind<IconsProvider>(IconsProvider).toSelf().inSingletonScope();
        this.container.bind<ViewsRegistry>(ViewsRegistry).toSelf().inSingletonScope();
    }
}

const container = new Binder().container;

export { container };