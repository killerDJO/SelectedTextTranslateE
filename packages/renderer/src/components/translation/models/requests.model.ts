import type { TranslateDescriptor } from './translation.model';

export interface TranslateRequest extends TranslateDescriptor {}

export interface PlayTextRequest {
  readonly text: string;
  readonly language?: string;
}
