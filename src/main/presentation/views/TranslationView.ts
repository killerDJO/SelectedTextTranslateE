import { screen } from "electron";
import { isNumber } from "util";
import { BehaviorSubject, Subject } from "rxjs";
import { map } from "rxjs/operators";
import * as _ from "lodash";

import { Messages } from "common/messaging/Messages";
import { ViewNames } from "common/ViewNames";
import { TranslationRequest } from "common/dto/translation/TranslationRequest";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";

import { LanguageSettings } from "common/dto/settings/LanguageSettings";

import { ViewContext } from "presentation/framework/ViewContext";
import { TranslateResultView } from "presentation/views/TranslateResultView";
import { TranslationViewSettings } from "business-logic/settings/dto/Settings";

export class TranslationView extends TranslateResultView {

    private currentScaleFactor: number | null = null;
    private currentTranslation: HistoryRecord | null = null;

    constructor(viewContext: ViewContext) {
        super(ViewNames.Translation, viewContext, {
            isFrameless: true,
            isScalingEnabled: new BehaviorSubject(true)
        });

        this.window.setAlwaysOnTop(true);
        this.window.setSkipTaskbar(true);

        this.window.on("blur", () => this.hide());
        this.window.on("hide", () => this.currentTranslation = null);

        this.setupSaveDimensions();
        this.setupSubscriptions();
    }

    public showTextInput(): void {
        this.messageBus.sendNotification(Messages.Translation.ShowInputCommand);
        this.show();
    }

    public setTranslateResult(historyRecord: HistoryRecord | null, defaultTranslateResultView: TranslateResultViews): Subject<void> {
        this.currentTranslation = historyRecord;
        return super.setTranslateResult(historyRecord, defaultTranslateResultView);
    }

    public isTranslationVisible(request: TranslationRequest): boolean {
        if (!this.window.isFocused()) {
            return false;
        }

        return this.areTranslationsEqual(request, this.currentTranslation);
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
        if (!!translationSettings.x && !!translationSettings.y && this.isSavedPositionValid(translationSettings)) {
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
        if (!isNumber(x) || !isNumber(y)) {
            return false;
        }

        for (const { workArea } of screen.getAllDisplays()) {
            const isWindowFitsOnDisplay =
                x > workArea.x
                && x + width < workArea.x + workArea.width
                && y > workArea.y
                && y + height < workArea.y + workArea.height;

            if (isWindowFitsOnDisplay) {
                return true;
            }
        }

        return false;
    }

    private setupSaveDimensions(): void {
        const oneSecond = 1000;
        const debouncedSaveDimension = _.debounce(() => this.saveDimensions(), oneSecond);
        this.window.on("resize", debouncedSaveDimension);
        this.window.on("move", debouncedSaveDimension);
    }

    private setupSubscriptions(): void {
        this.messageBus.registerObservable<LanguageSettings>(
            Messages.Translation.LanguageSettings,
            this.context.settingsProvider.getSettings().pipe(map(settings => settings.language)));
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

    private areTranslationsEqual(request: TranslationRequest, record: HistoryRecord | null): boolean {
        if (record === null) {
            return false;
        }

        const languageSettings = this.context.settingsProvider.getSettings().value.language;
        const sourceLanguage = request.sourceLanguage || languageSettings.sourceLanguage;
        const targetLanguage = request.targetLanguage || languageSettings.targetLanguage;
        return request.text === record.sentence
            && request.isForcedTranslation === record.isForcedTranslation
            && sourceLanguage === record.sourceLanguage
            && targetLanguage === record.targetLanguage;
    }
}