import { screen } from "electron";

export class ScaleProvider {
    private scaleFactor: number;

    constructor() {
        const primaryDisplay = screen.getPrimaryDisplay();
        const verticalResolution = primaryDisplay.workAreaSize.height;
        this.scaleFactor = verticalResolution / 860;
    }

    public scale(value: number) {
        return Math.round(this.scaleFactor * value);
    }
}