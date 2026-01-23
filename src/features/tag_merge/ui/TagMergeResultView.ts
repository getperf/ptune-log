// src/features/tag_merge/ui/TagMergeResultView.ts

import { TagMergePriorityGroupVM } from '../models/viewmodels/TagMergePriorityGroupVM';
import { TagSuggestionService } from 'src/features/tags/services/TagSuggestionService';
import { App } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';
import { TagMergePriorityTabs } from './TagMergePriorityTabs';
import { TagMergeRowBuilder } from './builders/TagMergeRowBuilder';
import { TargetTagEditorDialog } from 'src/core/ui/tags/TargetTagEditorDialog';
import { TagMergeRowVM } from '../models/viewmodels/TagMergeRowVM';
import { TagMergeGroupVM } from '../models/viewmodels/TagMergeGroupVM';

/**
 * TagMergeResultView
 * - 埋め込み可能な純 View
 * - DOM に直接描画する
 */
export class TagMergeResultView {
  private activePriorityGroup: TagMergePriorityGroupVM;
  private readonly rowBuilder: TagMergeRowBuilder;

  constructor(
    private readonly app: App,
    private readonly priorityGroups: TagMergePriorityGroupVM[],
    private readonly tagSuggestionService: TagSuggestionService,
  ) {
    this.activePriorityGroup = priorityGroups[0];
    this.rowBuilder = new TagMergeRowBuilder(
      this.app,
      this.tagSuggestionService,
    );
  }

  render(container: HTMLElement): void {
    container.empty();
    container.addClass('tag-merge-result-view');

    // --- Tabs ---
    const tabsEl = container.createDiv();
    new TagMergePriorityTabs(this.priorityGroups, (pg) => {
      this.activePriorityGroup = pg;
      this.renderBody(bodyEl);
    }).render(tabsEl);

    // --- Body ---
    const bodyEl = container.createDiv({ cls: 'tag-merge-result-body' });
    this.renderBody(bodyEl);

    logger.debug(
      `[TagMergeResultView] priorityGroups=${this.priorityGroups.length}`,
    );
  }

  private renderBody(container: HTMLElement): void {
    container.empty();
    this.renderPriorityGroup(container, this.activePriorityGroup);
  }

  private renderPriorityGroup(
    container: HTMLElement,
    pg: TagMergePriorityGroupVM,
  ): void {
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

  private renderGroup(container: HTMLElement, group: TagMergeGroupVM): void {
    const visibleRows = group.rows.filter((r) => this.shouldRenderRow(r));

    // ★ 単一行のみの場合は省略表示
    if (visibleRows.length === 1) {
      this.renderSingleRow(container, visibleRows[0]);
      return;
    }

    // --- 通常（複数行）表示 ---
    const groupEl = container.createDiv({ cls: 'tag-merge-group' });

    // Header
    const header = groupEl.createDiv({ cls: 'tag-merge-group-header' });

    const cb = header.createEl('input', { type: 'checkbox' });
    cb.checked = group.checked;

    const toLink = header.createEl('a', {
      text: `${group.to}(${group.toStat.count})`,
      href: '#',
      cls: 'tag-merge-to-link',
    });

    toLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.openTagEditDialog(group.to);
    });

    // Rows
    const list = groupEl.createDiv({ cls: 'tag-merge-group-list' });
    for (const row of visibleRows) {
      this.rowBuilder.render(list, row);
    }
  }

  /**
   * 単一行グループ表示
   * - to 見出しを省略
   * - row 表示のみ
   */
  private renderSingleRow(container: HTMLElement, row: TagMergeRowVM): void {
    const rowEl = container.createDiv({ cls: 'tag-merge-single-row' });
    this.rowBuilder.render(rowEl, row);
  }

  private shouldRenderRow(row: TagMergeRowVM): boolean {
    return row.from !== row.to;
  }

  private openTagEditDialog(to: string): void {
    logger.debug(`[TagMergeResultView] open edit dialog to=${to}`);

    new TargetTagEditorDialog(this.app, {
      state: { initialInput: to },
      search: this.tagSuggestionService,
      result: {
        confirm: async () => {},
      },
    }).open();
  }
}
