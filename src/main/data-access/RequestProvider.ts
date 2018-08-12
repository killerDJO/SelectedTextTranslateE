import axios from "axios";
import { Observable, defer, from } from "rxjs";
import { injectable } from "inversify";
import { map, catchError } from "rxjs/operators";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { NotificationSender } from "infrastructure/NotificationSender";

@injectable()
export class RequestProvider {
    private readonly userAgent: string;
    private readonly requestTimeout: number;

    constructor(
        private readonly notificationSender: NotificationSender,
        settingsProvider: SettingsProvider) {

        const settings = settingsProvider.getSettings().value;
        this.userAgent = settings.engine.userAgent;
        this.requestTimeout = settings.engine.requestTimeout;
    }

    public getStringContent(url: string): Observable<string> {
        return this.executeRequest(url).pipe(map(content => content.data.toString()));
    }

    public getBinaryContent(url: string): Observable<Buffer> {
        return this.executeRequest(url, "arraybuffer").pipe(map(content => content.data));
    }

    public getJsonContent<TContent>(url: string): Observable<TContent> {
        return this.executeRequest(url).pipe(map(content => content.data));
    }

    private executeRequest(url: string, responseType?: string): Observable<any> {
        return defer(() => {
            return from<any>(axios.get(url, {
                responseType: responseType,
                headers: {
                    "User-Agent": this.userAgent
                },
                timeout: this.requestTimeout
            }));
        }).pipe(
            catchError(error => this.notificationSender.showNonCriticalError("Network error has occurred.", error, `URL: ${url}`))
        );
    }
}