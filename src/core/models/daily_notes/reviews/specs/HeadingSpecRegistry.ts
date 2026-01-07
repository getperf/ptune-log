// src/core/models/daily_notes/reviews/specs/HeadingSpecRegistry.ts
import {
  HeadingSpec,
  TASK_HEADING_SPECS,
  NOTE_HEADING_SPECS,
} from './HeadingSpec';
import { DailyNoteLabelKey, SectionKey } from '../../SectionKey';

/**
 * HeadingSpecRegistry
 * - 全 HeadingSpec を一元管理
 * - key → HeadingSpec 解決を担当
 */
export class HeadingSpecRegistry {
  private static readonly registry: Map<DailyNoteLabelKey, HeadingSpec> =
    new Map(
      [...TASK_HEADING_SPECS, ...NOTE_HEADING_SPECS].map((s) => [s.key, s])
    );

  static get(key: DailyNoteLabelKey): HeadingSpec {
    const spec = this.registry.get(key);
    if (!spec) {
      throw new Error(`HeadingSpec not found: ${key}`);
    }
    return spec;
  }

  /** ✅ section 見出しのみ */
  static sectionSpecs(): Array<HeadingSpec & { key: SectionKey }> {
    return [...this.registry.values()].filter(
      (s) => s.kind === 'section'
    ) as Array<HeadingSpec & { key: SectionKey }>;
  }

  static has(key: DailyNoteLabelKey): boolean {
    return this.registry.has(key);
  }

  static all(): HeadingSpec[] {
    return [...this.registry.values()];
  }
}
