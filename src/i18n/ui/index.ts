// src/i18n/ui/index.ts

import type { Lang } from '../types';

import { getUiCommonI18n } from './common';
import { getUiSettingsBasicI18n } from './settings_basic';
import { getUiSettingsGoogleAuthI18n } from './google_auth';
import { getUiSettingsLlmI18n } from './settings_llm';
import { getUiSettingsNoteI18n } from './settings_note';
import { getUiSettingsSnippetI18n } from './settings_snippet';
import { getUiSettingsReviewI18n } from './settings_review';

export function getUiI18n(lang: Lang) {
  return {
    common: getUiCommonI18n(lang),
    settingsBasic: getUiSettingsBasicI18n(lang),
    settingsGoogleAuth: getUiSettingsGoogleAuthI18n(lang),
    settingsLlm: getUiSettingsLlmI18n(lang),
    settingsNote: getUiSettingsNoteI18n(lang),
    settingsSnippet: getUiSettingsSnippetI18n(lang),
    settingsReview: getUiSettingsReviewI18n(lang),
  };
}

export type UiI18n = ReturnType<typeof getUiI18n>;
