// features/tag_merge/models/TagMergeClusteringOptions.ts

export interface TagMergeClusteringOptions {
  k: number;
  iterations: number;

  exclusion: {
    unregisteredOnly: boolean;
    excludeIfClusterSizeAtLeast?: number;
  };

  priority: {
    largeClusterThreshold: number;
  };
}
