// tests/core/services/daily_notes/parse/HeadingSpecResolver.suffix.test.ts

import { HeadingSpecResolver } from 'src/core/services/daily_notes/parse/HeadingSpecResolver';
import { initLang } from './_helpers';

describe('HeadingSpecResolver suffix extract', () => {
  beforeAll(async () => {
    await initLang('ja');
  });

  test('kpt heading with suffix', () => {
    const line = '### 🧠 KPT分析 Suffix';
    const { spec, suffix } = HeadingSpecResolver.resolve(line);

    expect(spec?.key).toBe('note.kpt');
    expect(suffix).toContain(' Suffix');
  });

  test('daily report heading with suffix', () => {
    const line = '### 🏷 デイリーレポート（2026-01-07 17:00:00)';
    const { spec, suffix } = HeadingSpecResolver.resolve(line);

    expect(spec?.key).toBe('note.report');
    expect(suffix).toContain('（2026-01-07 17:00:00)');
  });

  test('task review heading with suffix', () => {
    const line = '### タスク振り返り Suffix';
    const { spec, suffix } = HeadingSpecResolver.resolve(line);

    expect(spec?.key).toBe('task.review');
    expect(suffix).toContain(' Suffix');
  });



});
