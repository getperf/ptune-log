// File: src/features/tag_merge/application/TagMergeContext.ts

import { TagMergeClusteringOptions } from '../models/TagMergeClusteringOptions';
import { TagMergePriorityGroupVM } from '../models/viewmodels/TagMergePriorityGroupVM';

export type TagMergeDebugOptions = {
  showRenameCandidateDebug: boolean;
};

/**
 * フェーズ間で共有する確定状態のみを保持する
 */
export class TagMergeContext {
  clusteringOptions!: TagMergeClusteringOptions;
  priorityGroups!: TagMergePriorityGroupVM[];

  /**
   * デバッグ・開発者向けオプション
   */
  debugOptions: TagMergeDebugOptions = {
    showRenameCandidateDebug: false,
  };

  constructor(init?: Partial<TagMergeContext>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
