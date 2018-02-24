import ComponentBase from "../ComponentBase";
import { Component } from "vue-property-decorator";
import { Messages } from "common/messaging/Messages";

@Component
export default class App extends ComponentBase {
    private scaleFactor: number = 1;

    constructor() {
        super();
        this.messageBus.getValue<number>(Messages.ScaleFactor).subscribe(this.updateScaleFactor);
    }

    public get scaleStyle(): any {
        return {
            transform: `scale(${this.scaleFactor})`
        };
    }

    private updateScaleFactor(scaleFactor: number): void {
        this.scaleFactor = scaleFactor;
    }
}