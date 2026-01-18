// src/features/tag_merge/models/TagMergeItemVM.ts

export type TagMergeItemVM = {
  from: string;
  to: string;
  count: number;

  // --- UI state ---
  checked: boolean;
};
