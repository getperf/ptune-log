// src/features/tag_merge/ui/TagMergeResultDialog.ts
import { App, Modal } from 'obsidian';
import { TagMergePriorityGroupVM } from '../models/TagMergePriorityGroupVM';
import { TAG_MERGE_PRIORITIES } from '../models/TagMergePriority';
import { TargetTagEditorDialog } from 'src/core/ui/tags/TargetTagEditorDialog';
import { TagSuggestionService } from 'src/features/tags/services/TagSuggestionService';
import { logger } from 'src/core/services/logger/loggerInstance';

/**
 * TagMergeResultDialog
 * - ViewModel を描画する
 * - チェックボックスと to 編集リンクを表示する
 * - 状態更新・永続化は行わない
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
   * グループ行（to 単位）
   * - 左：チェックボックス
   * - to：編集ダイアログへのリンク
   */
  private renderGroup(
    container: HTMLElement,
    group: TagMergePriorityGroupVM['groups'][number]
  ): void {
    const groupEl = container.createDiv({ cls: 'tag-merge-group' });

    const header = groupEl.createDiv({ cls: 'tag-merge-group-header' });

    const groupCheckbox = header.createEl('input', { type: 'checkbox' });
    groupCheckbox.checked = group.checked;

    const toLink = header.createEl('a', {
      text: `To: ${group.to}`,
      href: '#',
      cls: 'tag-merge-to-link',
    });

    toLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.openTagEditDialog(group.to);
    });

    const list = groupEl.createDiv({
      cls: 'tag-merge-group-list',
    });

    for (const item of group.items) {
      this.renderRow(list, item);
    }
  }

  /**
   * 各行（from → to）
   * - 左：チェックボックス
   * - to：編集ダイアログへのリンク
   */
  private renderRow(
    container: HTMLElement,
    item: TagMergePriorityGroupVM['groups'][number]['items'][number]
  ): void {
    const row = container.createDiv({ cls: 'tag-merge-row' });

    const cb = row.createEl('input', { type: 'checkbox' });
    cb.checked = item.checked;

    row.createSpan({
      text: item.from,
      cls: 'tag-merge-from',
    });

    row.createSpan({
      text: ' → ',
      cls: 'tag-merge-arrow',
    });

    const toLink = row.createEl('a', {
      text: item.to,
      href: '#',
      cls: 'tag-merge-to-link',
    });

    toLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.openTagEditDialog(item.to);
    });
  }

  /**
   * to 編集ダイアログを開く（状態更新はしない）
   */
  private openTagEditDialog(to: string): void {
    logger.debug(`[TagMergeResultDialog] open edit dialog to=${to}`);

    new TargetTagEditorDialog(this.app, {
      state: { initialInput: to },
      search: this.tagSuggestionService,
      result: {
        confirm: async () => {
          // 表示専用のため更新なし
        },
      },
    }).open();
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
