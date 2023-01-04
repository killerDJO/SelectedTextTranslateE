import type { TranslateDescriptor } from '~/components/translation/models/translation';

export function getLogKey(descriptor: TranslateDescriptor): string {
  return `for "${descriptor.sentence}" when forced translation is set to "${descriptor.isForcedTranslation}" with languages ${descriptor.sourceLanguage}-${descriptor.targetLanguage}`;
}
