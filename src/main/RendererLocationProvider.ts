import * as path from "path";

export class RendererLocationProvider {
    public static getRendererLocation(): string {
        return process.env.NODE_ENV === "dev"
            ? "http://localhost:8080"
            : `file:${path.resolve(__dirname, "..\\renderer\\index.html")}`;
    }
}