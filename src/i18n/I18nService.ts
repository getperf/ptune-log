// File: src/i18n/I18nService.ts

import type { I18nDict } from './schema';

export class I18nService {
  private dict!: I18nDict;

  /** 初期化（言語変更時にも使用） */
  init(dict: I18nDict) {
    this.dict = dict;
  }

  /** 現在の辞書を取得 */
  get t(): I18nDict {
    if (!this.dict) {
      throw new Error('[i18n] I18nService is not initialized');
    }
    return this.dict;
  }

  // --- sugar getters ---
  get common() {
    return this.t.common;
  }

  // Settings tabs 用
  get settings() {
    return this.t.settings;
  }
  get settingsNote() {
    return this.t.settingsNote;
  }
  get settingsLlm() {
    return this.t.settingsLlm;
  }

  get settingsSnippet() {
    return this.t.settingsSnippet;
  }
  get settingsGoogleAuth() {
    return this.t.settingsGoogleAuth;
  }
  get settingsReview() {
    return this.t.settingsReview;
  }

  // その他
  get dailyNoteSections() {
    return this.t.dailyNoteSections;
  }
  get llmTagGenerate() {
    return this.t.llmTagGenerate;
  }
  get noteSummaryMarkdown() {
    return this.t.noteSummaryMarkdown;
  }

}
