import { BehaviorSubject } from "rxjs";

export interface IScaler {
    readonly scaleFactor$: BehaviorSubject<number>;

    zoomIn(): void;
    zoomOut(): void;
    scale(value: number): number;
    rescale(value: number): number;
}