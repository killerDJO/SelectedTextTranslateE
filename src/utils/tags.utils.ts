import { isString } from 'lodash-es';

import { Tag } from '~/host/models/settings.model';

export function normalizeTag(tag: Tag | string): Tag {
  return isString(tag) ? { tag: tag, enabled: true } : tag;
}
