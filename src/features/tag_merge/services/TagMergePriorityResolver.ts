// src/features/tag_merge/services/TagMergePriorityResolver.ts

import { TagMergePriorityKey } from '../models/TagMergePriority';
import { TagMergePriorityDetector } from './detectors/TagMergePriorityDetector';

export class TagMergePriorityResolver {
  constructor(private readonly detectors: TagMergePriorityDetector[]) {}

  resolve(to: string, from: string): TagMergePriorityKey {
    for (const detector of this.detectors) {
      const result = detector.detect(to, from);
      if (result) return result;
    }
    return 'similar';
  }
}
