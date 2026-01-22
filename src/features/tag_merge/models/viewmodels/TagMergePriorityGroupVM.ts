// src/features/tag_merge/models/TagMergePriorityGroupVM.ts
import { TagMergePriorityKey } from '../domain/TagMergePriority';
import { TagMergeGroupVM } from './TagMergeGroupVM';

export type TagMergePriorityGroupVM = {
  priority: TagMergePriorityKey;

  // --- UI state（将来用） ---
  active: boolean;

  groups: TagMergeGroupVM[];
};
