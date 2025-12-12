// File: src/features/llm_tags/services/note_review/EditableNoteSummary.ts

import { NoteSummary } from 'src/core/models/notes/NoteSummary';

export interface EditableTagItem {
  name: string;
  enabled: boolean;
  isNew: boolean;
}

export interface EditableNoteSummary {
  summary: string;
  tags: EditableTagItem[];
  /** 保存時に dailynote を今日のデイリーノートリンクに更新するかどうか */
  updateDailyNote: boolean;
  /** 後から割り当てるタスクキー（任意） */
  taskKey?: string;

  /** 新規タグを追加（new1, new2 ...） */
  addNewTag: () => EditableTagItem;
}

/**
 * NoteSummary → UI 用 EditableNoteSummary 変換ファクトリ
 */
export class EditableNoteSummaryFactory {
  static fromNoteSummary(summary: NoteSummary): EditableNoteSummary {
    const editable: EditableNoteSummary = {
      summary: summary.summary ?? '',
      tags: (summary.tags ?? []).map((t) => ({
        name: t,
        enabled: true,
        isNew: summary.newTagCandidates?.includes(t) ?? false,
      })),
      updateDailyNote: true,
      taskKey: summary.taskKey,

      addNewTag() {
        // UI 追加「new / new2 / new3…」タグだけをカウントする
        const newTags = editable.tags.filter((tag) =>
          /^new(\d+)?$/.test(tag.name)
        );

        const nextIndex = newTags.length + 1;
        const tagName = nextIndex === 1 ? 'new' : `new${nextIndex}`;

        const newTag: EditableTagItem = {
          name: tagName,
          enabled: true,
          isNew: true,
        };

        editable.tags.push(newTag);
        return newTag;
      },
    };

    return editable;
  }
}
