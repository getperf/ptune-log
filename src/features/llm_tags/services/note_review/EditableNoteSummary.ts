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
  updateDailyNote: boolean;
}

/**
 * NoteSummary → UI 用 EditableNoteSummary 変換ファクトリ
 */
export class EditableNoteSummaryFactory {
  static fromNoteSummary(summary: NoteSummary): EditableNoteSummary {
    const baseSummary = summary.summary ?? '';

    const tags = (summary.tags ?? []).map<EditableTagItem>((tag) => ({
      name: tag,
      enabled: true,
      isNew: summary.newTagCandidates?.includes(tag) ?? false,
    }));

    return {
      summary: baseSummary,
      tags,
      updateDailyNote: true,
    };
  }
}
