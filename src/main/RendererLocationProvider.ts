import * as path from "path";

export class RendererLocationProvider {
    public static getRendererLocation(): string {
        return `file:${path.resolve(__dirname, "..\\renderer\\index.html")}`;
    }
}