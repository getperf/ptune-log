// File: src/config/SettingsTabSnippet.ts

import { Setting } from 'obsidian';
import type { ConfigManager, PluginSettings } from './ConfigManager';
import type { I18nDict } from 'src/i18n';

export function renderSnippetSettings(
  containerEl: HTMLElement,
  config: ConfigManager,
  settings: PluginSettings,
  i18n: I18nDict
) {
  const t = i18n.settingsSnippet;

  new Setting(containerEl)
    .setName(t.snippetFile.name)
    .setDesc(t.snippetFile.desc)
    .addText((text) =>
      text
        .setPlaceholder(t.snippetFile.placeholder)
        .setValue(settings.snippet.filename)
        .onChange(async (value) => {
          await config.update('snippet.filename', value.trim() || 'snippet.md');
        })
    );
}
