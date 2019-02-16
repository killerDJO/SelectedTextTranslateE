import { Observable } from "rxjs";
import { mapSubject } from "utils/map-subject";

import { ApplicationInfo } from "common/dto/about/ApplicationInfo";
import { Messages } from "common/messaging/Messages";
import { ViewNames } from "common/ViewNames";

import { readJsonFile } from "utils/read-json";

import { ViewBase } from "presentation/framework/ViewBase";
import { ViewContext } from "presentation/framework/ViewContext";

export class AboutView extends ViewBase {
    public readonly checkForUpdates$: Observable<number>;

    constructor(viewContext: ViewContext) {
        super(ViewNames.About, viewContext, {
            iconName: "tray",
            isFrameless: false,
            title: "About",
            isScalingEnabled: mapSubject(viewContext.scalingSettings, scaling => !scaling.scaleTranslationViewOnly)
        });

        const packageJson = readJsonFile("../../../package.json");
        const applicationInfo: ApplicationInfo = {
            name: packageJson.productName,
            homepage: packageJson.homepage,
            version: packageJson.version
        };
        this.messageBus.sendValue<ApplicationInfo>(Messages.About.ApplicationInfo, applicationInfo);

        this.checkForUpdates$ = this.messageBus.observeCommand(Messages.About.CheckForUpdates);
    }

    protected getInitialBounds(): Electron.Rectangle {
        const aboutViewSettings = this.context.viewsSettings.about;
        return this.getCentralPositionAbsolute(aboutViewSettings.width, aboutViewSettings.height);
    }
}