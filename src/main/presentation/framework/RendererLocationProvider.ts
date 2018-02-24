import * as path from "path";
import { injectable } from "inversify";

@injectable()
export class RendererLocationProvider {
    public static getRendererLocation(): string {
        return `file:${path.resolve(__dirname, "..\\renderer\\index.html")}`;
    }
}