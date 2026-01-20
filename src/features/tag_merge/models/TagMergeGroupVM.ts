// src/features/tag_merge/models/TagMergeGroupVM.ts
import { TagStat } from 'src/core/models/tags/TagStat';
import { TagMergeItemVM } from './TagMergeItemVM';

export type TagMergeGroupVM = {
  to: string;

  // --- UI state ---
  checked: boolean;

  /** 代表タグの統計情報（UI 用） */
  toStat: TagStat;

  items: TagMergeItemVM[];
};
