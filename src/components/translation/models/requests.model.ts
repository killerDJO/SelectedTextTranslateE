import type { TranslateDescriptor } from './translation.model';

export type TranslateRequest = TranslateDescriptor;

export interface PlayTextRequest {
  readonly text: string;
  readonly language?: string;
}
