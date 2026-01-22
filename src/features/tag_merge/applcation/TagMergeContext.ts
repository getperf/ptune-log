// features/tag_merge/application/TagMergeContext.ts

import { TagMergeClusteringOptions } from '../models/TagMergeClusteringOptions';
import { TagMergePriorityGroupVM } from '../models/viewmodels/TagMergePriorityGroupVM';

/**
 * フェーズ間で共有する確定状態のみを保持する
 */
export class TagMergeContext {
  /**
   * クラスタリング条件（Prepare で確定）
   */
  clusteringOptions!: TagMergeClusteringOptions;

  /**
   * レビュー用 ViewModel（クラスタリング結果）
   * Review / Apply で参照
   */
  priorityGroups!: TagMergePriorityGroupVM[];

  constructor(init?: Partial<TagMergeContext>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
