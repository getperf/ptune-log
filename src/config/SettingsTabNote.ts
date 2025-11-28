import { Setting } from 'obsidian';
import type { PluginSettings, ConfigManager } from './ConfigManager';

/**
 * Note設定セクションを描画
 * @param containerEl - 設定タブのコンテナ要素
 * @param config - 設定マネージャ（ConfigManagerインスタンス）
 * @param settings - 現在の設定状態（表示用）
 */
export function renderNoteSettings(
  containerEl: HTMLElement,
  config: ConfigManager,
  settings: PluginSettings
) {
  const note = settings.note;

  containerEl.createEl('h2', { text: 'ノート作成設定' });

  new Setting(containerEl)
    .setName('Note folder prefix')
    .setDesc('Prefix type for note folder')
    .addDropdown((dropdown) =>
      dropdown
        .addOptions({
          serial: 'Serial',
          date: 'Date',
        })
        .setValue(config.get<string>('note.folderPrefix'))
        .onChange(async (value) => {
          await config.update('note.folderPrefix', value);
        })
    );

  new Setting(containerEl)
    .setName('Note prefix')
    .setDesc('Prefix type for notes')
    .addDropdown((dropdown) =>
      dropdown
        .addOptions({
          serial: 'Serial',
          date: 'Date',
        })
        .setValue(config.get<string>('note.notePrefix'))
        .onChange(async (value) => {
          await config.update('note.notePrefix', value);
        })
    );

  new Setting(containerEl)
    .setName('Prefix digits')
    .setDesc('Number of digits for the prefix')
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
    .setName('Note template')
    .setDesc('Enter the note template.')
    .addTextArea((text) => {
      text
        .setPlaceholder('Template here...')
        .setValue(config.get<string>('note.templateText'))
        .onChange(async (value) => {
          await config.update('note.templateText', value);
        });
      text.inputEl.classList.add('my-template-textarea');
    });
}
