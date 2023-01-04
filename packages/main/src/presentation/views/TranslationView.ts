import { screen } from 'electron';
import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';

import { Messages } from '@selected-text-translate/common/messaging/messages';
import { ViewNames } from '@selected-text-translate/common/views/view-names';
import { TranslationViewSettings } from '@selected-text-translate/common/settings/Settings';

import { ViewContext } from '~/presentation/framework/ViewContext';

import { TranslateResultView } from './TranslateResultView';

export class TranslationView extends TranslateResultView {
  private currentScaleFactor?: number;

  constructor(viewContext: ViewContext) {
    super(ViewNames.Translation, viewContext, {
      isFrameless: true,
      isScalingEnabled: new BehaviorSubject(true)
    });

    this.window.setAlwaysOnTop(true);
    this.window.setSkipTaskbar(true);

    this.window.on('blur', () => this.hide());

    this.setupSaveDimensions();
  }

  public translateText(text: string, showDefinitions: boolean): void {
    this.messageBus.sendMessage(
      Messages.Main.Translation.TranslateTextCommand,
      text,
      showDefinitions
    );
    this.show();
  }

  public playText(text: string): void {
    this.messageBus.sendMessage(Messages.Main.Translation.PlayTextCommand, text);
  }

  public showTextInput(): void {
    this.messageBus.sendMessage(Messages.Main.Translation.TranslateInputCommand);
    this.show();
  }

  protected scaleBounds(bounds: Electron.Rectangle): Electron.Rectangle {
    const bottomRightX = bounds.x + bounds.width;
    const bottomRightY = bounds.y + bounds.height;
    const previousScaleFactor = this.currentScaleFactor || this.scaler.scaleFactor$.value;
    const width = this.scaler.rescaleValue(bounds.width, previousScaleFactor);
    const height = this.scaler.rescaleValue(bounds.height, previousScaleFactor);

    this.setCurrentScaleFactor();

    return {
      width: width,
      height: height,
      x: bottomRightX - width,
      y: bottomRightY - height
    };
  }

  protected getInitialBounds(): Electron.Rectangle {
    const primaryDisplay = screen.getPrimaryDisplay();

    const translationSettings = this.context.viewsSettings.translation;
    const width = this.scaler.scaleValue(translationSettings.width);
    const height = this.scaler.scaleValue(translationSettings.height);

    let x: number;
    let y: number;
    if (
      !!translationSettings.x &&
      !!translationSettings.y &&
      this.isSavedPositionValid(translationSettings)
    ) {
      x = translationSettings.x;
      y = translationSettings.y;
    } else {
      x = primaryDisplay.workArea.width - width - translationSettings.margin;
      y = primaryDisplay.workArea.height - height - translationSettings.margin;
    }

    this.setCurrentScaleFactor();

    return {
      width: width,
      height: height,
      x: x,
      y: y
    };
  }

  private isSavedPositionValid({ x, y, width, height }: TranslationViewSettings): boolean {
    if (!(typeof x === 'number') || !(typeof y === 'number')) {
      return false;
    }

    for (const { workArea } of screen.getAllDisplays()) {
      const isWindowFitsOnDisplay =
        x > workArea.x &&
        x + width < workArea.x + workArea.width &&
        y > workArea.y &&
        y + height < workArea.y + workArea.height;

      if (isWindowFitsOnDisplay) {
        return true;
      }
    }

    return false;
  }

  private setupSaveDimensions(): void {
    const oneSecond = 1000;
    const debouncedSaveDimension = _.debounce(() => this.saveDimensions(), oneSecond);
    this.window.on('resize', debouncedSaveDimension);
    this.window.on('move', debouncedSaveDimension);
  }

  private saveDimensions(): void {
    const bounds = this.window.getBounds();
    this.context.settingsProvider.updateSettings({
      views: {
        translation: {
          height: this.scaler.downscaleValue(bounds.height),
          width: this.scaler.downscaleValue(bounds.width),
          x: bounds.x,
          y: bounds.y
        }
      }
    });
  }

  private setCurrentScaleFactor(): void {
    this.currentScaleFactor = this.scaler.scaleFactor$.value;
  }
}
