import { app } from "electron";
import { injectable } from "inversify";

@injectable()
export class StorageFolderProvider {
    public getPath(): string {
        return app.getPath("userData");
    }
}