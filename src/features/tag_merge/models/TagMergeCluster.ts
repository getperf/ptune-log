// src/features/tag_merge/models/TagMergeCluster.ts
export type TagMergeCluster = {
  to: string; // representative
  members: {
    from: string;
    count: number;
  }[];
};
