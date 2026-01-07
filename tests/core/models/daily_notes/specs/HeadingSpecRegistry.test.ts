// tests/core/models/daily_notes/specs/HeadingSpecRegistry.test.ts
import { HeadingSpecRegistry } from 'src/core/models/daily_notes/specs/HeadingSpecRegistry';
import { initI18n } from 'src/i18n';
import type { DailyNoteLabelKey } from 'src/core/models/daily_notes/SectionKey';

describe('HeadingSpecRegistry (i18n aware)', () => {
  beforeEach(() => {
    // 念のためキャッシュ再構築前提を作る
    // （rebuildLabels は各テストで明示的に呼ぶ）
  });

  test('resolves normalized labels in Japanese', () => {
    initI18n('ja');
    HeadingSpecRegistry.rebuildLabels();

    const label = HeadingSpecRegistry.getLabel(
      'task.planned' satisfies DailyNoteLabelKey
    );

    expect(label).toBeDefined();
    expect(label).toContain('今日の予定タスク');
  });

  test('resolves normalized labels in English', () => {
    initI18n('en');
    HeadingSpecRegistry.rebuildLabels();

    const label = HeadingSpecRegistry.getLabel(
      'task.planned' satisfies DailyNoteLabelKey
    );

    // 例: "Planned Tasks"
    expect(label).toBeDefined();
    expect(label).toContain('Planned Tasks');
  });

  test('switching language rebuilds label cache', () => {
    initI18n('ja');
    HeadingSpecRegistry.rebuildLabels();
    const jaLabel = HeadingSpecRegistry.getLabel('task.planned');

    initI18n('en');
    HeadingSpecRegistry.rebuildLabels();
    const enLabel = HeadingSpecRegistry.getLabel('task.planned');

    expect(jaLabel).not.toEqual(enLabel);
  });

  test('sectionSpecs returns section-only specs', () => {
    const specs = HeadingSpecRegistry.sectionSpecs();

    expect(specs.length).toBeGreaterThan(0);
    for (const spec of specs) {
      expect(spec.kind).toBe('section');
    }
  });

  test('getSpec throws for unknown key', () => {
    expect(() =>
      HeadingSpecRegistry.getSpec('unknown.key' as DailyNoteLabelKey)
    ).toThrow(/HeadingSpec not found/);
  });
});
