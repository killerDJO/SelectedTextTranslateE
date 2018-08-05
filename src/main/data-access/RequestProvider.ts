import axios from "axios";
import { Observable, defer, from } from "rxjs";
import { injectable } from "inversify";
import { map } from "rxjs/operators";

@injectable()
export class RequestProvider {
    private readonly userAgent: string = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36";

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
                }
            }));
        });
    }
}