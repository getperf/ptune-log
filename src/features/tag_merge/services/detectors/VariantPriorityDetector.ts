// src/features/tag_merge/services/detectors/VariantPriorityDetector.ts

import { TagMergePriorityDetector } from './TagMergePriorityDetector';
import { normalizeTagForCompare } from 'src/core/utils/tag/normalizeTag';

export class VariantPriorityDetector implements TagMergePriorityDetector {
  detect(to: string, from: string): 'variant' | undefined {
    if (from === to) return undefined;

    const normTo = normalizeTagForCompare(to);
    const normFrom = normalizeTagForCompare(from);

    return normFrom === normTo ? 'variant' : undefined;
  }
}
