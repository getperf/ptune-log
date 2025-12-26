// File: src/i18n/index.ts

import type { Lang } from './types';
import type { I18nDict } from './schema';
export type { I18nDict };

import { commonJa } from './ja/common';
import { commonEn } from './en/common';

import { settingsJa } from './ja/settings';
import { settingsEn } from './en/settings';

import { settingsGoogleAuthJa } from './ja/settings_google_auth';
import { settingsGoogleAuthEn } from './en/settings_google_auth';

import { settingsNoteJa } from './ja/settings_note';
import { settingsNoteEn } from './en/settings_note';

import { settingsSnippetJa } from './ja/settings_snippet';
import { settingsSnippetEn } from './en/settings_snippet';

import { settingsLlmJa } from './ja/settings_llm';
import { settingsLlmEn } from './en/settings_llm';

import { settingsReviewJa } from './ja/settings_review';
import { settingsReviewEn } from './en/settings_review';

const dict: Record<Lang, I18nDict> = {
  ja: {
    common: commonJa,
    settings: settingsJa,
    settingsGoogleAuth: settingsGoogleAuthJa,
    settingsNote: settingsNoteJa,
    settingsSnippet: settingsSnippetJa,
    settingsLlm: settingsLlmJa,
    settingsReview: settingsReviewJa,
  },
  en: {
    common: commonEn,
    settings: settingsEn,
    settingsGoogleAuth: settingsGoogleAuthEn,
    settingsNote: settingsNoteEn,
    settingsSnippet: settingsSnippetEn,
    settingsLlm: settingsLlmEn,
    settingsReview: settingsReviewEn,
  },
};

export function getI18n(lang: Lang): I18nDict {
  return dict[lang] ?? dict.ja;
}
