import { injectable } from "inversify";

import { ViewNames } from "common/ViewNames";
import { ViewBase } from "presentation/framework/ViewBase";
import { ViewContext } from "presentation/framework/ViewContext";
import { TranslationView } from "presentation/views/TranslationView";
import { SettingsView } from "presentation/views/SettingsView";
import { HistoryView } from "presentation/views/HistoryView";

@injectable()
export class ViewsRegistry {
    private readonly viewsCache: Map<ViewNames, ViewBase> = new Map<ViewNames, ViewBase>();

    private readonly viewFactories: Map<ViewNames, (viewContext: ViewContext) => ViewBase> = new Map<ViewNames, (viewContext: ViewContext) => ViewBase>([
        [ViewNames.Translation, viewContext => new TranslationView(viewContext)],
        [ViewNames.History, viewContext => new HistoryView(viewContext)],
        [ViewNames.Settings, viewContext => new SettingsView(viewContext)]
    ]);

    constructor(private readonly viewContext: ViewContext) {
    }

    public getOrCreateView<TView extends ViewBase>(name: ViewNames, postCreateAction?: (view: TView) => void): TView {
        const existingView = this.getView(name);
        if (existingView === null) {
            this.viewsCache.set(name, this.createView<TView>(name, postCreateAction));
        }

        return this.viewsCache.get(name) as TView;
    }

    public getView<TView extends ViewBase>(name: ViewNames): TView | null {
        const existingView = this.viewsCache.get(name) || null;
        if (existingView === null || existingView.isDestroyed()) {
            return null;
        }

        return existingView as TView;
    }

    public exists(name: ViewNames): boolean {
        return this.getView(name) !== null;
    }

    private createView<TView extends ViewBase>(name: ViewNames, postCreateAction?: (view: TView) => void): TView {
        const viewFactory = this.viewFactories.get(name);
        if (viewFactory === undefined) {
            throw Error(`View ${name} is not supported by ViewsRegistry.`);
        }

        const createdView = viewFactory(this.viewContext) as TView;

        if (!!postCreateAction) {
            postCreateAction(createdView);
        }

        return createdView;
    }
}