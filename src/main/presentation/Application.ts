import { app, ipcMain, SystemPreferences } from "electron";
import { injectable, inject } from "inversify";

import { Taskbar } from "presentation/Taskbar";
import { TranslationView } from "presentation/views/TranslationView";
import { TextTranslator } from "business-logic/translation/TextTranslator";
import { TextExtractor } from "business-logic/translation/TextExtractor";
import { TextPlayer } from "business-logic/translation/TextPlayer";
import { StorageFolderProvider } from "infrastructure/StorageFolderProvider";
import { ViewContext } from "presentation/framework/ViewContext";
import { HotkeysRegistry } from "presentation/hotkeys/HotkeysRegistry";
import { IconsProvider } from "presentation/infrastructure/IconsProvider";
import { ViewsRegistry } from "presentation/views/ViewsRegistry";
import { ViewNames } from "common/ViewNames";
import { ViewBase } from "presentation/framework/ViewBase";

@injectable()
export class Application {
    private taskbar!: Taskbar;

    constructor(
        private readonly textTranslator: TextTranslator,
        private readonly textPlayer: TextPlayer,
        private readonly viewContext: ViewContext,
        private readonly hotkeysRegistry: HotkeysRegistry,
        private readonly iconsProvider: IconsProvider,
        private readonly textExtractor: TextExtractor,
        private readonly viewsRegistry: ViewsRegistry,
        private readonly storageFolderProvider: StorageFolderProvider) {

        this.createTaskbar();
        this.setupHotkeys();
    }

    private setupTranslationView(translationView: TranslationView): void {
        translationView.playText$.subscribe(text => this.textPlayer.playText(text));
        translationView.translateText$.subscribe(text => this.translateText(text, false));
        translationView.forceTranslateText$.subscribe(text => this.translateText(text, true));
    }

    private setupHotkeys(): void {
        this.hotkeysRegistry.registerHotkeys();
        this.hotkeysRegistry.translate$.subscribe(() => {
            this.textExtractor.getSelectedText();
        });

        this.hotkeysRegistry.zoomIn$.subscribe(() => this.viewContext.scaler.zoomIn());
        this.hotkeysRegistry.zoomOut$.subscribe(() => this.viewContext.scaler.zoomOut());

        this.textExtractor.textToTranslate$.subscribe(text => this.translateText(text, false));
    }

    private createTaskbar(): void {
        this.taskbar = new Taskbar(this.storageFolderProvider, this.iconsProvider);

        this.taskbar.showTranslation$.subscribe(() => this.showView(ViewNames.TranslationResult, this.setupTranslationView.bind(this)));
        this.taskbar.showSettings$.subscribe(() => this.showView(ViewNames.Settings));
    }

    private translateText(text: string, isForcedTranslation: boolean): void {
        this.textTranslator.translate(text, isForcedTranslation).subscribe(result => {
            const translationView = this.showView<TranslationView>(ViewNames.TranslationResult, this.setupTranslationView.bind(this));
            translationView.setTranslateResult(result);
        });
    }

    private showView<TView extends ViewBase>(viewName: ViewNames, postCreateAction?: (view: TView) => void): TView {
        const view = this.viewsRegistry.getOrCreateView<TView>(viewName, postCreateAction);
        view.show();
        return view;
    }
}