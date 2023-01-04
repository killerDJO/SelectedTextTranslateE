import { Observable } from 'rxjs';
import * as path from 'path';
import * as fs from 'fs';

import { Messages } from '@selected-text-translate/common/messaging/messages';
import { ViewNames } from '@selected-text-translate/common/views/view-names';
import { ApplicationInfo } from '@selected-text-translate/common/messaging/about';

import { ViewContext } from '~/presentation/framework/ViewContext';
import { mapSubject } from '~/utils/map-subject';

import { ViewBase } from './ViewBase';

export class AboutView extends ViewBase {
  public readonly checkForUpdates$: Observable<void>;

  constructor(viewContext: ViewContext) {
    super(ViewNames.About, viewContext, {
      iconName: 'tray',
      isFrameless: false,
      title: 'About',
      isScalingEnabled: mapSubject(
        viewContext.scalingSettings,
        scaling => !scaling.scaleTranslationViewOnly
      )
    });

    const packageJson = this.readJsonFile('../../../../../package.json');
    const applicationInfo: ApplicationInfo = {
      name: packageJson.productName,
      homepage: packageJson.homepage,
      version: packageJson.version
    };
    this.messageBus.listenToMessage(
      Messages.Renderer.About.GetApplicationInfo,
      () => applicationInfo
    );
    this.window.webContents.openDevTools();

    this.checkForUpdates$ = this.messageBus.observeMessage(
      Messages.Renderer.About.CheckForUpdatesCommand
    );
  }

  protected getInitialBounds(): Electron.Rectangle {
    const aboutViewSettings = this.context.viewsSettings.about;
    return this.getCentralPositionAbsolute(aboutViewSettings.width, aboutViewSettings.height);
  }

  private readJsonFile(fileName: string): any {
    const filePath = path.resolve(__dirname, fileName);
    const fileContent = fs.readFileSync(filePath).toString('utf8');
    return JSON.parse(fileContent);
  }
}
