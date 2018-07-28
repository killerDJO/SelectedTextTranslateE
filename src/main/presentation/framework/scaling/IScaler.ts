import { BehaviorSubject } from "rxjs";

export interface IScaler {
    readonly scaleFactor$: BehaviorSubject<number>;

    zoomIn(): void;
    zoomOut(): void;
    scaleValue(value: number): number;
    rescaleValue(value: number): number;
}