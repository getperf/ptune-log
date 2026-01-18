// src/features/tag_merge/ui/TagMergeResultDialog.ts
import { App, Modal } from 'obsidian';
import { TagMergePriorityGroupVM } from '../models/TagMergePriorityGroupVM';
import { TAG_MERGE_PRIORITIES } from '../models/TagMergePriority';
import { TargetTagEditorDialog } from 'src/core/ui/tags/TargetTagEditorDialog';
import { TagSuggestionService } from 'src/features/tags/services/TagSuggestionService';
import { logger } from 'src/core/services/logger/loggerInstance';

/**
 * TagMergeResultDialog
 * - ViewModel を描画するダイアログ
 * - to は編集ダイアログを開けるが、状態更新は行わない
 */
export class TagMergeResultDialog extends Modal {
  constructor(
    app: App,
    private readonly priorityGroups: TagMergePriorityGroupVM[],
    private readonly tagSuggestionService: TagSuggestionService
  ) {
    super(app);
  }

  onOpen(): void {
    this.render();
  }

  private render(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('tag-merge-result-modal');

    contentEl.createEl('h2', { text: 'タグマージ候補（優先度別）' });

    for (const pg of this.priorityGroups) {
      this.renderPriorityGroup(contentEl, pg);
    }

    logger.debug(
      `[TagMergeResultDialog] priorityGroups=${this.priorityGroups.length}`
    );
  }

  private renderPriorityGroup(
    container: HTMLElement,
    pg: TagMergePriorityGroupVM
  ): void {
    const meta = TAG_MERGE_PRIORITIES.get(pg.priority);

    container.createEl('h3', {
      text: meta?.labelKey ?? pg.priority,
      cls: 'tag-merge-priority-header',
    });

    if (pg.groups.length === 0) {
      container.createEl('p', {
        text: '対象なし',
        cls: 'tag-merge-empty',
      });
      return;
    }

    for (const group of pg.groups) {
      this.renderGroup(container, group);
    }
  }

  /**
   * グループ（to 単位）の描画
   * - to は編集ダイアログへのリンク
   */
  private renderGroup(
    container: HTMLElement,
    group: TagMergePriorityGroupVM['groups'][number]
  ): void {
    const groupEl = container.createDiv({ cls: 'tag-merge-group' });

    const title = groupEl.createEl('a', {
      text: `To: ${group.to}`,
      href: '#',
      cls: 'tag-merge-group-title link',
    });

    title.addEventListener('click', (e) => {
      e.preventDefault();
      this.openTagEditDialog(group.to);
    });

    const list = groupEl.createDiv({
      cls: 'tag-merge-group-list',
    });

    for (const item of group.items) {
      list.createEl('div', {
        text: `${item.from} → ${item.to}`,
        cls: 'tag-merge-row',
      });
    }
  }

  /**
   * to 編集ダイアログを開く（更新はしない）
   */
  private openTagEditDialog(to: string): void {
    logger.debug(`[TagMergeResultDialog] open edit dialog to=${to}`);

    const dialog = new TargetTagEditorDialog(this.app, {
      state: {
        initialText: to,
      },
      search: this.tagSuggestionService,
      result: {
        confirm: async () => {
          // 表示専用のため更新は行わない
        },
      },
    });

    dialog.open();
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
