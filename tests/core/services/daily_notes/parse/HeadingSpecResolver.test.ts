// tests/core/services/daily_notes/parse/HeadingSpecResolver.test.ts

import { HeadingSpecResolver } from 'src/core/services/daily_notes/parse/HeadingSpecResolver';
import { HeadingLabelResolver } from 'src/core/services/daily_notes/parse/HeadingLabelResolver';
import { initI18n } from 'src/i18n';

describe('HeadingSpecResolver', () => {
  beforeAll(async () => {
    await initI18n('ja');
    HeadingLabelResolver.rebuild();
  });

  test('review memo heading with emoji', () => {
    const line = '## 🙌 振り返りメモ';
    const { spec, level } = HeadingSpecResolver.resolve(line);

    expect(level).toBe(2);
    expect(spec?.key).toBe('note.review.memo');
  });

  test('kpt heading with suffix', () => {
    const line = '### 🧠 KPT分析（2回目）';
    const { spec, suffix } = HeadingSpecResolver.resolve(line);

    expect(spec?.key).toBe('note.kpt');
    expect(suffix).toContain('2回目');
  });

  test('fragment heading is ignored as section', () => {
    const line = '### タグ一覧';
    const { spec } = HeadingSpecResolver.resolve(line);

    // fragment は section としては解決されない
    expect(spec).toBeUndefined();
  });

  test('non-heading line', () => {
    const line = 'ただの本文';
    const { spec, level } = HeadingSpecResolver.resolve(line);

    expect(level).toBe(0);
    expect(spec).toBeUndefined();
  });
});
