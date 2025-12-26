// File: src/config/SettingTabReview.ts

import { Setting } from 'obsidian';
import { ConfigManager } from './ConfigManager';
import type { I18nDict } from 'src/i18n';

export function renderReviewSettings(
  containerEl: HTMLElement,
  manager: ConfigManager,
  i18n: I18nDict
) {
  const t = i18n.settingsReview;

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
