// src/features/tag_merge/models/TagMergePriority.ts

/**
 * 優先度キー（i18n key / 内部識別子）
 * - enum にしない（i18n を単純化）
 */
export type TagMergePriorityKey = 'hierarchy' | 'variant' | 'similar' | 'other';

/**
 * UI 表示・並び順・説明をまとめた定義
 */
export const TAG_MERGE_PRIORITIES: Map<
  TagMergePriorityKey,
  {
    labelKey: string; // i18n key
    order: number; // タブ表示順
  }
> = new Map([
  ['hierarchy', { labelKey: 'tagMerge.priority.hierarchy', order: 1 }],
  ['variant', { labelKey: 'tagMerge.priority.variant', order: 2 }],
  ['similar', { labelKey: 'tagMerge.priority.similar', order: 3 }],
  ['other', { labelKey: 'tagMerge.priority.other', order: 99 }],
]);
