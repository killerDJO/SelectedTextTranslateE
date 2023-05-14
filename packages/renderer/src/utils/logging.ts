import type { TranslateDescriptor } from '~/components/translation/models/translation';
import { Logger } from '~/services/logger';

export function getLogKey(descriptor: TranslateDescriptor): string {
  return `for "${descriptor.sentence}" when forced translation is set to "${descriptor.isForcedTranslation}" with languages ${descriptor.sourceLanguage}-${descriptor.targetLanguage}`;
}

export async function traceTimings<TResult>(
  logger: Logger,
  traceName: string,
  action: () => Promise<TResult>
): Promise<TResult> {
  logger.info(`[Start]: ${traceName}`);
  const startTime = Date.now();

  const result = await action();

  const elapsedTime = Date.now() - startTime;
  logger.info(`[End]: ${traceName}". Elapsed time: ${elapsedTime}ms.`);

  return result;
}
