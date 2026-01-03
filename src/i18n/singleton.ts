// src/i18n/singleton.ts

import type { I18nRoot } from './I18nRoot';

class I18nSingleton {
  ui!: I18nRoot['ui'];

  init(root: I18nRoot) {
    this.ui = root.ui;
  }
}

export const i18n = new I18nSingleton();
