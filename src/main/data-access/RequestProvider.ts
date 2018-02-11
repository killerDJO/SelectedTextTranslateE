
import axios from "axios";
import * as Rx from "rxjs/Rx";

export class RequestProvider {
    private readonly userAgent: string = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36";

    public getStringContent(url: string): Rx.Observable<string> {
        return this.executeRequest(url).map(content => content.data.toString());
    }

    private executeRequest(url: string): Rx.Observable<any> {
        return Rx.Observable.fromPromise<any>(axios.get(url, {
            headers: {
                "User-Agent": this.userAgent
            }
        }));
    }
}