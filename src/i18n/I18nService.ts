// src/i18n/I18nService.ts
import type { I18nDict } from './schema';

/**
 * I18nService
 * - i18n 辞書をアプリ全体で共有するシングルトン
 * - UI層（SettingTab 等）から直接参照する
 */
class I18nService {
  private dict?: I18nDict;

  /** 初期化（言語切替時もここを呼ぶ） */
  init(dict: I18nDict): void {
    this.dict = dict;
  }

  /** 辞書取得（未初期化時は例外） */
  t(): I18nDict {
    if (!this.dict) {
      throw new Error('[I18nService] not initialized');
    }
    return this.dict;
  }
}

export const i18n = new I18nService();

