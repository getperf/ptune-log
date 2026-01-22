// src/features/tag_merge/models/TagMergeRowVM.ts

import { TagStat } from 'src/core/models/tags/TagStat';

export type TagMergeRowVM = {
  from: string;
  to: string;
  count: number;

  // --- UI state ---
  checked: boolean;

  /** TagStat（UI 用） */
  fromStat: TagStat;
};
