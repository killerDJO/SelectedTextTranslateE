import { injectable } from 'inversify';

import { ViewNames } from '@selected-text-translate/common';

import { ViewContext } from '~/presentation/framework/view-context.service';

import { BaseView } from './base.view';
import { TranslationView } from './translation.view';
import { SettingsView } from './settings.view';
import { HistoryView } from './history.view';
import { AboutView } from './about.view';

@injectable()
export class ViewsRegistry {
  private readonly viewsCache: Map<ViewNames, BaseView> = new Map<ViewNames, BaseView>();

  private readonly viewFactories: Map<ViewNames, (viewContext: ViewContext) => BaseView> = new Map<
    ViewNames,
    (viewContext: ViewContext) => BaseView
  >([
    [ViewNames.Translation, viewContext => new TranslationView(viewContext)],
    [ViewNames.History, viewContext => new HistoryView(viewContext)],
    [ViewNames.Settings, viewContext => new SettingsView(viewContext)],
    [ViewNames.About, viewContext => new AboutView(viewContext)]
  ]);

  constructor(private readonly viewContext: ViewContext) {}

  public getOrCreateView<TView extends BaseView>(
    name: ViewNames,
    postCreateAction?: (view: TView) => void
  ): TView {
    const existingView = this.getView(name);
    if (existingView === null) {
      this.viewsCache.set(name, this.createView<TView>(name, postCreateAction));
    }

    return this.viewsCache.get(name) as TView;
  }

  public getView<TView extends BaseView>(name: ViewNames): TView | null {
    const existingView = this.viewsCache.get(name) || null;
    if (existingView === null || existingView.isDestroyed()) {
      return null;
    }

    return existingView as TView;
  }

  public exists(name: ViewNames): boolean {
    return this.getView(name) !== null;
  }

  private createView<TView extends BaseView>(
    name: ViewNames,
    postCreateAction?: (view: TView) => void
  ): TView {
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
