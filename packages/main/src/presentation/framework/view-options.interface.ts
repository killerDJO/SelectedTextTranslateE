import { BehaviorSubject } from 'rxjs';

export interface ViewOptions {
  readonly title?: string;
  readonly iconName?: string;
  readonly isFrameless: boolean;
  readonly isScalingEnabled: BehaviorSubject<boolean>;
}
