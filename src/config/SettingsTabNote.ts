// File: src/config/SettingsTabNote.ts

import { Setting } from 'obsidian';
import type { PluginSettings, ConfigManager } from './ConfigManager';
import type { I18nDict } from 'src/i18n';

export function renderNoteSettings(
  containerEl: HTMLElement,
  config: ConfigManager,
  settings: PluginSettings,
  i18n: I18nDict
) {
  const t = i18n.settingsNote;

  containerEl.createEl('h2', { text: t.sectionTitle });

  new Setting(containerEl)
    .setName(t.folderPrefix.name)
    .setDesc(t.folderPrefix.desc)
    .addDropdown((dropdown) =>
      dropdown
        .addOptions({
          serial: t.folderPrefix.options.serial,
          date: t.folderPrefix.options.date,
        })
        .setValue(config.get<string>('note.folderPrefix'))
        .onChange(async (value) => {
          await config.update('note.folderPrefix', value);
        })
    );

  new Setting(containerEl)
    .setName(t.notePrefix.name)
    .setDesc(t.notePrefix.desc)
    .addDropdown((dropdown) =>
      dropdown
        .addOptions({
          serial: t.notePrefix.options.serial,
          date: t.notePrefix.options.date,
        })
        .setValue(config.get<string>('note.notePrefix'))
        .onChange(async (value) => {
          await config.update('note.notePrefix', value);
        })
    );

  new Setting(containerEl)
    .setName(t.prefixDigits.name)
    .setDesc(t.prefixDigits.desc)
    .addDropdown((dropdown) =>
      dropdown
        .addOptions({
          '2': '2',
          '3': '3',
          '4': '4',
          '5': '5',
        })
        .setValue(config.get<number>('note.prefixDigits').toString())
        .onChange(async (value) => {
          const num = parseInt(value, 10);
          if (!isNaN(num)) {
            await config.update('note.prefixDigits', num);
          }
        })
    );

  new Setting(containerEl)
    .setName(t.template.name)
    .setDesc(t.template.desc)
    .addTextArea((text) => {
      text
        .setPlaceholder(t.template.placeholder)
        .setValue(config.get<string>('note.templateText'))
        .onChange(async (value) => {
          await config.update('note.templateText', value);
        });
      text.inputEl.classList.add('my-template-textarea');
    });
}
