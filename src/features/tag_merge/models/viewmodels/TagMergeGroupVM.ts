// src/features/tag_merge/models/TagMergeGroupVM.ts
import { TagStat } from 'src/core/models/tags/TagStat';
import { TagMergeRowVM } from './TagMergeRowVM';

export type TagMergeGroupDisplayMode =
  | 'normal' // from → to list
  | 'toOnly'; // to link only (Other)

export type TagMergeGroupVM = {
  to: string;

  // --- UI state ---
  checked: boolean;

  /** 代表タグの統計情報（UI 用） */
  toStat: TagStat;

  /** 表示モード(Oherかそれ以外) */
  displayMode: TagMergeGroupDisplayMode;

  rows: TagMergeRowVM[];
};
