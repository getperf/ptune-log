// File: src/i18n/singleton.ts

import { I18nService } from './I18nService';
import { getI18n } from './index';

export const i18n = new I18nService();

i18n.init(getI18n('ja'));
