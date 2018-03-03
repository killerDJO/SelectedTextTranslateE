import { ComponentBase } from "../ComponentBase";
import { Component } from "vue-property-decorator";
import { Messages } from "common/messaging/Messages";

@Component
export default class App extends ComponentBase {
    private accentColor: string = "";
    private scaleFactor: number = 1;

    constructor() {
        super();
        this.messageBus.getValue<string>(Messages.AccentColor).subscribe(this.updateAccentColor);
        this.messageBus.getValue<number>(Messages.ScaleFactor).subscribe(this.updateScaleFactor);
    }

    public get accentStyle(): any {
        return {
            "border-color": `#${this.accentColor}`
        };
    }

    public get scaleStyle(): any {
        return {
            zoom: `${this.scaleFactor * 100}%`
        };
    }

    private updateAccentColor(accentColor: string): void {
        this.accentColor = accentColor;
        this.forceRepaint();
    }

    private updateScaleFactor(scaleFactor: number): void {
        this.scaleFactor = scaleFactor;
        this.forceRepaint();
    }

    private forceRepaint(): void {
        this.$el.style.display = "none";
        // tslint:disable-next-line:no-unused-expression [No need to store this anywhere, the reference is enough]
        this.$el.offsetHeight;
        this.$el.style.display = "block";
    }
}