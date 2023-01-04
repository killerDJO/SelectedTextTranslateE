import { BehaviorSubject } from 'rxjs';

export interface IScaler {
  readonly scaleFactor$: BehaviorSubject<number>;

  zoomIn(): void;
  zoomOut(): void;
  reset(): void;
  scaleValue(value: number): number;
  downscaleValue(value: number): number;
  rescaleValue(value: number, previousScaleFactor: number): number;
}
