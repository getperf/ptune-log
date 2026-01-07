// tests/core/services/daily_notes/parse/_helpers.ts
import { initI18n } from 'src/i18n';

export async function initLang(lang: 'ja' | 'en') {
  await initI18n(lang);
}
