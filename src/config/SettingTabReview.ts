// File: src/config/SettingTabReview.ts

import { Setting } from 'obsidian';
import { ConfigManager } from './ConfigManager';
import { ReviewSettingKeys } from './keys/ReviewSettingKeys';
import { i18n } from 'src/i18n';

export function renderReviewSettings(
  containerEl: HTMLElement,
  manager: ConfigManager,
) {
  const t = i18n.ui.settingsReview;

  const section = containerEl.createDiv({ cls: 'review-section' });
  section.createEl('h3', { text: t.sectionTitle });

  // --- 共通タグ ---
  new Setting(section)
    .setName(t.enableCommonTag.name)
    .setDesc(t.enableCommonTag.desc)
    .addToggle((toggle) => {
      toggle
        .setValue(manager.get<boolean>(ReviewSettingKeys.enableCommonTag))
        .onChange(async (value) => {
          await manager.update(ReviewSettingKeys.enableCommonTag, value);
        });
    });

  // --- デイリーノートユーザレビュー ---
  new Setting(section)
    .setName(t.enableDailyNoteUserReview.name)
    .setDesc(t.enableDailyNoteUserReview.desc)
    .addToggle((toggle) => {
      toggle
        .setValue(
          manager.get<boolean>(ReviewSettingKeys.enableDailyNoteUserReview),
        )
        .onChange(async (value) => {
          await manager.update(
            ReviewSettingKeys.enableDailyNoteUserReview,
            value,
          );
        });
    });

  // --- KPT 出力形式 ---
  new Setting(section)
    .setName(t.kptOutputMode.name)
    .setDesc(t.kptOutputMode.desc)
    .addDropdown((dropdown) => {
      dropdown
        .addOption('markdown', t.kptOutputMode.options.markdown)
        .addOption('text', t.kptOutputMode.options.text)
        .setValue(manager.get(ReviewSettingKeys.kptOutputMode))
        .onChange(async (value) => {
          await manager.update(ReviewSettingKeys.kptOutputMode, value);
        });
    });

  // --- Sentence 要約モード ---
  new Setting(section)
    .setName(t.sentenceMode.name)
    .setDesc(t.sentenceMode.desc)
    .addDropdown((dropdown) => {
      dropdown
        .addOption('none', t.sentenceMode.options.none)
        .addOption('llm', t.sentenceMode.options.llm)
        .setValue(manager.get(ReviewSettingKeys.sentenceMode))
        .onChange(async (value) => {
          await manager.update(ReviewSettingKeys.sentenceMode, value);
        });
    });

  // --- ノート要約 出力形式 ---
  new Setting(section)
    .setName(t.noteSummaryOutputFormat.name)
    .setDesc(t.noteSummaryOutputFormat.desc)
    .addDropdown((dropdown) => {
      dropdown
        .addOption('outliner', t.noteSummaryOutputFormat.options.outliner)
        .addOption('xmind', t.noteSummaryOutputFormat.options.xmind)
        .setValue(manager.get(ReviewSettingKeys.noteSummaryOutputFormat))
        .onChange(async (value) => {
          await manager.update(
            ReviewSettingKeys.noteSummaryOutputFormat,
            value,
          );
        });
    });
}
