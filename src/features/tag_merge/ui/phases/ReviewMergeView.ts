// src/features/tag_merge/ui/phases/ReviewMergeView.ts

import { Setting, App } from 'obsidian';
import { TagMergePhaseView } from './TagMergePhaseView';
import { TagMergeResultView } from '../TagMergeResultView';
import { TagMergePriorityGroupVM } from '../../models/TagMergePriorityGroupVM';
import { TagSuggestionService } from 'src/features/tags/services/TagSuggestionService';

export class ReviewMergeView implements TagMergePhaseView {
  constructor(
    private readonly app: App,
    private readonly priorityGroups: TagMergePriorityGroupVM[],
    private readonly tagSuggestionService: TagSuggestionService,
    private readonly onRunMerge: () => void,
    private readonly onCancel: () => void,
  ) {}

  getTitle(): string {
    return '名寄せ候補の確認と修正';
  }

  renderBody(container: HTMLElement): void {
    // 結果一覧は DOM View
    new TagMergeResultView(
      this.app,
      this.priorityGroups,
      this.tagSuggestionService,
    ).render(container);
  }

  getStatusMessage(): string | undefined {
    return undefined;
  }

  renderActions(container: HTMLElement): void {
    const setting = new Setting(container);
    setting.settingEl.addClass('tag-merge-actions');

    setting
      .addButton((btn) =>
        btn.setButtonText('キャンセル').onClick(() => {
          this.onCancel();
        }),
      )
      .addButton((btn) =>
        btn
          .setButtonText('タグマージ実行')
          .setCta()
          .onClick(() => {
            this.onRunMerge();
          }),
      );
  }
}
