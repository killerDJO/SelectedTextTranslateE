import * as path from "path";
import { injectable } from "inversify";

@injectable()
export class IconsProvider {
    public getIconPath(iconName: string): string {
        return path.resolve(__dirname, `icons\\${iconName}.ico`);
    }
}