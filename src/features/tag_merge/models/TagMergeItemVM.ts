// src/features/tag_merge/models/TagMergeItemVM.ts

import { TagStat } from 'src/core/models/tags/TagStat';

export type TagMergeItemVM = {
  from: string;
  to: string;
  count: number;

  // --- UI state ---
  checked: boolean;

  /** TagStat（UI 用） */
  fromStat: TagStat;
};
