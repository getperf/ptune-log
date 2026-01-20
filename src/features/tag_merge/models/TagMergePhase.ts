// src/features/tag_merge/models/TagMergePhase.ts

export type TagMergePhase =
  | 'prepare'
  | 'clustering'
  | 'reviewMerge'
  | 'updateMerge'
  | 'complete';
