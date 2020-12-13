import axios, { AxiosResponse } from "axios";
import { Observable, defer, from } from "rxjs";
import { injectable } from "inversify";
import { map } from "rxjs/operators";
const HttpsProxyAgent  = require('https-proxy-agent');

import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { ProxySettings } from "business-logic/settings/dto/Settings";
import { Logger } from "infrastructure/Logger";

@injectable()
export class RequestProvider {
    private readonly userAgent: string;
    private readonly requestTimeout: number;
    private readonly proxySettings: ProxySettings;
    private readonly logger: Logger;

    constructor(settingsProvider: SettingsProvider, logger: Logger) {
        this.logger = logger;

        const settings = settingsProvider.getSettings().value;
        this.userAgent = settings.engine.userAgent;
        this.requestTimeout = settings.engine.requestTimeout;
        this.proxySettings = settings.engine.proxy;

        if(settings.engine.enableRequestsLogging) {
            this.addRequestsLogging();
        }
    }

    public executeGoogleTranslateRequest<TContent>(url: string, formData: string): Observable<TContent> {
        return this.executePostRequest(url, formData).pipe(map(response => this.parseGoogleResponse(response)));
    }

    private parseGoogleResponse<TContent>(response: string): TContent {
        const lines = response.split('\n');
        const responseLine = lines.find(line => line.indexOf("MkEWBc") !== -1);
        if(!responseLine) {
            throw new Error("Unable to find google response");
        }

        const responseLineJson = JSON.parse(responseLine + ']');
        const responseContent = responseLineJson[0][2];
        return JSON.parse(responseContent);
    }

    private executePostRequest(url: string, data?: string): Observable<any> {
        if(this.proxySettings.isEnabled) {
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
        }
        
        return defer(() => {
            return from<Promise<AxiosResponse<any>>>(axios.post(url, data, {
                headers: {
                    "User-Agent": this.userAgent,
                    "X-Same-Domain": 1,
                    "DNT": 1,
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                    "Accept": "*/*",
                    "Origin": "https://translate.google.com",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Dest": "empty",
                    "Referer": "https://translate.google.com/",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept-Language": "en-US,en;q=0.9,ru-RU;q=0.8,ru;q=0.7,de;q=0.6,es;q=0.5,uk;q=0.4"
                },
                httpsAgent: this.proxySettings.isEnabled ? new HttpsProxyAgent(this.proxySettings.url) : undefined,
                timeout: this.requestTimeout
            })).pipe(map(response => response.data));
        });
    }

    private addRequestsLogging(): void {
        axios.interceptors.request.use(request => {
            const loggable = {
                url: request.url,
                headers: request.headers,
                method: request.method,
                timeout: request.timeout
            }
            this.logger.info(`Starting Request: ${JSON.stringify(loggable)}`);
            return request
          })
          
        axios.interceptors.response.use(response => {
            const loggable = { data: response.data, headers: response.headers, status: response.status };
            this.logger.info(`Response: ${JSON.stringify(loggable)}`);
            return response
        })
    }
}