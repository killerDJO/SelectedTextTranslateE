import { injectable } from "inversify";
import * as keytar from "keytar";

import { UserInfo } from "common/dto/UserInfo";
import { Observable, from, AsyncSubject, of } from "rxjs";
import { concatMap } from "rxjs/operators";

@injectable()
export class UserStore {
    private static readonly ServiceName: string = "Selected Text Translate";

    public setCurrentUser(userInfo: UserInfo): Observable<void> {
        return from(keytar.setPassword(UserStore.ServiceName, userInfo.email.toLowerCase(), userInfo.password));
    }

    public getCurrentUser(): AsyncSubject<UserInfo | null> {
        const result = new AsyncSubject<UserInfo | null>();
        keytar.findCredentials(UserStore.ServiceName).then(credentials => {
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

            return from(keytar.deletePassword(UserStore.ServiceName, currentUser.email));
        }));
    }
}