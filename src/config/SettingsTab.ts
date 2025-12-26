// File: src/config/SettingsTab.ts

import { App, PluginSettingTab, Setting } from 'obsidian';
import type PtunePlugin from '../../main';
import type { ConfigManager } from './ConfigManager';
import { renderLLMSettings } from './SettingTabLLM';
import { renderNoteSettings } from './SettingsTabNote';
import { renderSnippetSettings } from './SettingsTabSnippet';
import { renderGoogleAuthSettings } from './SettingsTabGoogleAuth';
import { renderReviewSettings } from './SettingTabReview';
import type { LogLevel } from 'src/core/services/logger/Logger';

import { getI18n } from 'src/i18n';
import { isLang, type Lang } from 'src/i18n/types';

function isLogLevel(v: string): v is LogLevel {
  return ['debug', 'info', 'warn', 'error', 'none'].includes(v);
}

export class PtuneSettingTab extends PluginSettingTab {
  private plugin: PtunePlugin;
  private config: ConfigManager;

  constructor(app: App, plugin: PtunePlugin, config: ConfigManager) {
    super(app, plugin);
    this.plugin = plugin;
    this.config = config;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // --- language (prototype) ---
    const lang = (this.config.get<string>('ui.language') || 'ja') as Lang;
    const i18n = getI18n(lang);

    new Setting(containerEl)
      .setName(i18n.common.language.name)
      .setDesc(i18n.common.language.desc)
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            ja: i18n.common.language.options.ja,
            en: i18n.common.language.options.en,
          })
          .setValue(lang)
          .onChange(async (value: string) => {
            if (isLang(value)) {
              await this.config.update('ui.language', value);
            }
            this.display();
          })
      );

    new Setting(containerEl).setName(i18n.settings.basic.heading).setHeading();

    new Setting(containerEl)
      .setName(i18n.settings.logLevel.name)
      .setDesc(i18n.settings.logLevel.desc)
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            debug: i18n.settings.logLevel.options.debug,
            info: i18n.settings.logLevel.options.info,
            warn: i18n.settings.logLevel.options.warn,
            error: i18n.settings.logLevel.options.error,
            none: i18n.settings.logLevel.options.none,
          })
          .setValue(this.config.get<LogLevel>('logLevel'))
          .onChange(async (value: string) => {
            if (isLogLevel(value)) {
              await this.config.update<LogLevel>('logLevel', value);
            }
            this.display();
          })
      );

    new Setting(containerEl)
      .setName(i18n.settings.enableLogFile.name)
      .setDesc(i18n.settings.enableLogFile.desc)
      .addToggle((toggle) =>
        toggle
          .setValue(this.config.get('enableLogFile'))
          .onChange(async (value) => {
            await this.config.update('enableLogFile', value);
            this.display();
          })
      );

    // --- sections ---
    renderNoteSettings(containerEl, this.config, this.config.settings, i18n);
    renderSnippetSettings(containerEl, this.config, this.config.settings, i18n);
    renderLLMSettings(
      containerEl,
      this.config,
      this.config.settings,
      this,
      i18n
    );
    renderGoogleAuthSettings(
      containerEl,
      this.config,
      this.config.settings,
      i18n
    );
    renderReviewSettings(containerEl, this.config, i18n);
  }
}
