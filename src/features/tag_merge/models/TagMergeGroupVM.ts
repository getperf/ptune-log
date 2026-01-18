// src/features/tag_merge/models/TagMergeGroupVM.ts
import { TagMergeItemVM } from './TagMergeItemVM';

export type TagMergeGroupVM = {
  to: string;

  // --- UI state ---
  checked: boolean;

  items: TagMergeItemVM[];
};
