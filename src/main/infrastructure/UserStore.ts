import { injectable } from "inversify";
import * as keytar from "keytar";

import { UserInfo } from "common/dto/UserInfo";
import { Observable, from, AsyncSubject, of } from "rxjs";
import { concatMap } from "rxjs/operators";

@injectable()
export class UserStore {
    private static readonly ServiceName: string = "Selected Text Translate";

    private get serviceName(): string {
        if (process.env.NODE_ENV === "development") {
            return `${UserStore.ServiceName} - Dev`;
        }

        return UserStore.ServiceName;
    }

    public setCurrentUser(userInfo: UserInfo): Observable<void> {
        return from(keytar.setPassword(this.serviceName, userInfo.email.toLowerCase(), userInfo.password));
    }

    public getCurrentUser(): AsyncSubject<UserInfo | null> {
        const result = new AsyncSubject<UserInfo | null>();
        keytar.findCredentials(this.serviceName).then(credentials => {
            if (credentials.length > 0) {
                result.next({
                    email: credentials[0].account,
                    password: credentials[0].password
                });
            } else {
                result.next(null);
            }
            result.complete();
        });

        return result;
    }

    public clearCurrentUser(): Observable<boolean> {
        return this.getCurrentUser().pipe(concatMap((currentUser: UserInfo | null) => {
            if (!currentUser) {
                return of(false);
            }

            return from(keytar.deletePassword(this.serviceName, currentUser.email));
        }));
    }
}