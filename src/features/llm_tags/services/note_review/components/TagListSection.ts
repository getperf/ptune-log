// File: src/features/llm_tags/services/note_review/components/TagListSection.ts

import { EditableNoteSummary, EditableTagItem } from '../EditableNoteSummary';

export class TagListSection {
  /**
   * タグ一覧 UI を描画
   * @param container 表示先の HTMLElement
   * @param editable 編集対象モデル
   * @param onEditTag タグクリック時の処理（Modal 側から渡す）
   * @param onReRender 再描画依頼（Modal 側で this.render を渡す）
   */
  static render(
    container: HTMLElement,
    editable: EditableNoteSummary,
    onEditTag: (tag: EditableTagItem) => void,
    onReRender: () => void
  ) {
    // --- ヘッダ行（タイトル + 追加ボタン） ---
    const headerRow = container.createEl('div', {
      cls: 'ptune-tag-header-row',
    });

    headerRow.createEl('h3', {
      text: 'タグ一覧',
      cls: 'ptune-tag-header-title',
    });

    const addBtn = headerRow.createEl('button', {
      text: 'タグ追加',
      cls: 'clickable ptune-tag-add-btn',
    });

    addBtn.addEventListener('click', () => {
      editable.addNewTag();
      onReRender();
    });

    // --- タグ一覧本体 ---
    const listEl = container.createEl('div', { cls: 'ptune-tag-list' });

    editable.tags.forEach((tag) => {
      const row = listEl.createEl('div', { cls: 'ptune-tag-row' });

      // タグ名リンク
      const link = row.createEl('a', {
        text: tag.name,
        cls: 'ptune-tag-link',
        href: '#',
      });

      link.addEventListener('click', (ev) => {
        ev.preventDefault();
        onEditTag(tag);
      });

      // 有効／無効チェック
      const cb = row.createEl('input', { type: 'checkbox' });
      cb.checked = tag.enabled;

      cb.addEventListener('change', () => {
        tag.enabled = cb.checked;
      });
    });
  }
}
