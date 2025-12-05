// File: src/config/SettingTabReview.ts
import { Setting } from 'obsidian';
import { ConfigManager } from './ConfigManager';

export function renderReviewSettings(
  containerEl: HTMLElement,
  manager: ConfigManager
) {
  const newSection = containerEl.createDiv({ cls: 'review-section' });
  newSection.createEl('h3', { text: '振り返り設定' });

  new Setting(containerEl)
    .setName('共通タグ抽出を有効にする')
    .setDesc('ノート振り返り時に共通タグ抽出を実行します。')
    .addToggle((toggle) => {
      toggle
        .setValue(manager.get<boolean>('review.enableCommonTag'))
        .onChange(async (value) => {
          await manager.update('review.enableCommonTag', value);
        });
    });
}
