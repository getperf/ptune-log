// File: src/config/SettingTabReview.ts

import { Setting } from 'obsidian';
import { ConfigManager } from './ConfigManager';

import { i18n } from 'src/i18n';

export function renderReviewSettings(
  containerEl: HTMLElement,
  manager: ConfigManager
) {
  const t = i18n.ui.settingsReview;

  // 既存クラス名を維持（CSS / 再描画依存対策）
  const newSection = containerEl.createDiv({ cls: 'review-section' });
  newSection.createEl('h3', { text: t.sectionTitle });

  new Setting(containerEl)
    .setName(t.enableCommonTag.name)
    .setDesc(t.enableCommonTag.desc)
    .addToggle((toggle) => {
      toggle
        .setValue(manager.get<boolean>('review.enableCommonTag'))
        .onChange(async (value) => {
          await manager.update('review.enableCommonTag', value);
        });
    });
}
