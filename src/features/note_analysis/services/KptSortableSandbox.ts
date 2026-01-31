// src/features/note_analysis/KptSortableSandbox.ts

import { App, Modal, Plugin } from 'obsidian';
import Sortable from 'sortablejs';

/* =========================
 * モデル定義（最小）
 * ========================= */
type TreeNode = {
  id: string;
  text: string;
  children?: TreeNode[];
};

type KptRoot = {
  keep: TreeNode[];
  problem: TreeNode[];
  try: TreeNode[];
};

/* =========================
 * サンプルデータ
 * ========================= */
export const SAMPLE_DATA: KptRoot = {
  keep: [
    {
      id: 'k1',
      text: 'プロジェクト1',
      children: [
        {
          id: 'k1-1',
          text: 'ノート1',
          children: [
            { id: 'k1-1-1', text: 'センテンス1' },
            { id: 'k1-1-2', text: 'センテンス2' },
          ],
        },
      ],
    },
  ],
  problem: [{ id: 'p1', text: '課題A' }],
  try: [{ id: 't1', text: '改善案X' }],
};

/* =========================
 * モーダル
 * ========================= */
export class KptSortableModal extends Modal {
  private sortables: Sortable[] = [];

  constructor(
    app: App,
    private readonly data: KptRoot,
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('kpt-sortable-modal');

    contentEl.createEl('h2', { text: 'KPT 編集（検証用）' });

    this.renderSection(contentEl, 'Keep', this.data.keep);
    this.renderSection(contentEl, 'Problem', this.data.problem);
    this.renderSection(contentEl, 'Try', this.data.try);
  }

  onClose(): void {
    this.sortables.forEach((s) => s.destroy());
    this.sortables = [];
  }

  /* =========================
   * 描画
   * ========================= */
  private renderSection(
    container: HTMLElement,
    title: string,
    nodes: TreeNode[],
  ): void {
    container.createEl('h3', { text: title });

    const ul = container.createEl('ul', {
      cls: 'kpt-tree',
    });

    nodes.forEach((n) => this.renderNode(ul, n));
    this.attachSortable(ul);
  }

  private renderNode(parent: HTMLElement, node: TreeNode): void {
    const li = parent.createEl('li', { cls: 'tree-node' });

    const row = li.createDiv({ cls: 'tree-row' });
    row.createSpan({ cls: 'drag-handle', text: '≡ ' });
    row.createSpan({ text: node.text });

    if (node.children && node.children.length > 0) {
      const ul = li.createEl('ul');
      node.children.forEach((c) => this.renderNode(ul, c));
      this.attachSortable(ul);
    }
  }

  /* =========================
   * SortableJS 初期化
   * ========================= */
  private attachSortable(el: HTMLElement): void {
    const sortable = new Sortable(el, {
      group: 'kpt-tree',
      animation: 150,
      fallbackOnBody: true,
      handle: '.drag-handle',
      draggable: '.tree-node',
    });
    this.sortables.push(sortable);
  }
}

/* =========================
 * コマンド登録
 * ========================= */
export class KptSortableSandboxPlugin extends Plugin {
  onload(): void {
    this.addCommand({
      id: 'open-kpt-sortable-sandbox',
      name: 'KPT 編集（SortableJS 検証）',
      callback: () => {
        new KptSortableModal(this.app, SAMPLE_DATA).open();
      },
    });
  }
}
