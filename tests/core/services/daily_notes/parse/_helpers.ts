// tests/core/services/daily_notes/parse/_helpers.ts
import { initI18n } from 'src/i18n';
import { HeadingSpecRegistry } from 'src/core/models/daily_notes/specs/HeadingSpecRegistry';

export async function initLang(lang: 'ja' | 'en') {
  await initI18n(lang);
  HeadingSpecRegistry.rebuildLabels();
}
