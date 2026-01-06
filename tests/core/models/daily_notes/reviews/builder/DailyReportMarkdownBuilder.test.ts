// tests/core/models/daily_notes/reviews/builder/DailyReportMarkdownBuilder.test.ts

import { DailyReportMarkdownBuilder } from 'src/core/models/daily_notes/reviews/builder/DailyReportMarkdownBuilder';
import { HeadingBuilder } from 'src/core/utils/daily_note/HeadingBuilder';
import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';
import { i18n, getI18n } from 'src/i18n';

describe('DailyReportMarkdownBuilder', () => {
  const dateStr = '2026-01-03';

  beforeAll(() => {
    i18n.init('ja', getI18n('ja'));
  });

  function mockSummaries(): NoteSummaries {
    return {
      summaryMarkdown: jest
        .fn()
        .mockReturnValue(
          [
            '##### [[_project/A]]',
            '- [x] done A',
            '',
            '###### ユーザレビュー',
            '- review A',
          ].join('\n')
        ),
    } as unknown as NoteSummaries;
  }

  test('builds daily report with date suffix', () => {
    const summaries = mockSummaries();

    const markdown = DailyReportMarkdownBuilder.build(summaries, dateStr, {
      enableChecklist: true,
    });

    expect(markdown).toContain(
      HeadingBuilder.create('note.report', {
        suffix: `（${dateStr})`,
      })
    );
    expect(markdown).toContain('done A');
    expect(markdown).toContain('review A');
  });

  test('includes checklist instruction when enabled', () => {
    const summaries = mockSummaries();

    const markdown = DailyReportMarkdownBuilder.build(summaries, dateStr, {
      enableChecklist: true,
    });

    expect(markdown).toContain(
      '※ 以下の項目で正しくない内容をチェックし、レビュー欄に補足を追加してください。'
    );
  });

  test('omits checklist instruction when disabled', () => {
    const summaries = mockSummaries();

    const markdown = DailyReportMarkdownBuilder.build(summaries, dateStr, {
      enableChecklist: false,
    });

    expect(markdown).not.toContain('チェック');
  });
});
