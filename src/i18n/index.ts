// src/i18n/index.ts

import type { Lang } from './types';
import type { I18nRoot } from './I18nRoot';
import { getUiI18n } from './ui';

export function getI18n(lang: Lang): I18nRoot {
  return {
    ui: getUiI18n(lang),
  };
}

export type { Lang };
export { i18n } from './singleton';
