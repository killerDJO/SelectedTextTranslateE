import type { TranslateDescriptor } from '~/components/translation/models/translation.model';
import { Logger } from '~/services/logger.service';

export function getLogKey(descriptor: TranslateDescriptor): string {
  return `sentence: [${descriptor.sentence}], forced: ${descriptor.isForcedTranslation}, ${descriptor.sourceLanguage}-${descriptor.targetLanguage}`;
}

export async function traceTimings<TResult>(
  logger: Logger,
  traceName: string,
  action: () => Promise<TResult>
): Promise<TResult> {
  logger.info(`[Start] > ${traceName}`);
  const startTime = Date.now();

  const result = await action();

  const elapsedTime = Date.now() - startTime;
  logger.info(`[End] > ${traceName}. Elapsed time: ${elapsedTime}ms.`);

  return result;
}
