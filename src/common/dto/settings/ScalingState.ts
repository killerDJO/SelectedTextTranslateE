export interface ScalingState {
    readonly scaleFactor: number;
    readonly autoScaleFactor: number;
    readonly minScaling: number;
    readonly maxScaling: number;
    readonly scalingStep: number;
}