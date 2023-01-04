import { isString } from 'lodash-es';

import type { Tag } from '@selected-text-translate/common/settings/settings';

export function normalizeTag(tag: Tag | string): Tag {
  return isString(tag) ? { tag: tag, isEnabled: true } : tag;
}
