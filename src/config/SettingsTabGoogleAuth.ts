// File: src/config/SettingsTabGoogleAuth.ts

import { Setting } from 'obsidian';
import type { PluginSettings, ConfigManager } from './ConfigManager';
import type { I18nDict } from 'src/i18n';

export function renderGoogleAuthSettings(
  containerEl: HTMLElement,
  config: ConfigManager,
  settings: PluginSettings,
  i18n: I18nDict
) {
  const section = containerEl.querySelector('.google-auth-section');
  if (section) section.remove();

  const t = i18n.settingsGoogleAuth;

  const newSection = containerEl.createDiv({ cls: 'google-auth-section' });
  newSection.createEl('h3', { text: t.sectionTitle });

  new Setting(newSection)
    .setName(t.useWinApp.name)
    .setDesc(t.useWinApp.desc)
    .addToggle((toggle) =>
      toggle
        .setValue(settings.google_auth.useWinApp)
        .onChange(async (value) => {
          await config.update('google_auth.useWinApp', value);
          renderGoogleAuthSettings(containerEl, config, config.settings, i18n);
        })
    );

  const disabled = settings.google_auth.useWinApp;

  new Setting(newSection)
    .setName(t.clientId.name)
    .setDesc(t.clientId.desc)
    .addText((text) =>
      text
        .setPlaceholder(t.clientId.placeholder)
        .setValue(settings.google_auth.clientId)
        .setDisabled(disabled)
        .onChange(async (value) => {
          await config.update('google_auth.clientId', value.trim());
        })
    );

  new Setting(newSection)
    .setName(t.clientSecret.name)
    .setDesc(t.clientSecret.desc)
    .addText((text) =>
      text
        .setPlaceholder(t.clientSecret.placeholder)
        .setValue(settings.google_auth.clientSecret)
        .setDisabled(disabled)
        .onChange(async (value) => {
          await config.update('google_auth.clientSecret', value.trim());
        })
    );
}
