// src/features/tag_merge/models/TagMergeCluster.ts

import { TagMergePriorityKey } from './TagMergePriority';

/**
 * TagMergeCluster
 * - KMeans クラスタを tag_merge ドメイン用に変換した中間モデル
 * - 優先度（priority）はここで確定させる
 */
export type TagMergeCluster = {
  to: string;
  priority: TagMergePriorityKey;
  members: {
    from: string;
    count: number;
  }[];
};
