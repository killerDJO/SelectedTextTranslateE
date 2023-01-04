import type { TranslateDescriptor } from './translation';

export interface TranslateRequest extends TranslateDescriptor {
  readonly refreshCache: boolean;
}

export interface PlayTextRequest {
  readonly text: string;
  readonly language?: string;
}
