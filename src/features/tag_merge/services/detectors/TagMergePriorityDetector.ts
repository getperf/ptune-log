// src/features/tag_merge/services/detectors/TagMergePriorityDetector.ts

import { TagMergePriorityKey } from '../../models/TagMergePriority';

export interface TagMergePriorityDetector {
  detect(to: string, from: string): TagMergePriorityKey | undefined;
}
