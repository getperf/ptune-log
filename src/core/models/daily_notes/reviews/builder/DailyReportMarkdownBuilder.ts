import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';
import { HeadingBuilder } from 'src/core/utils/daily_note/HeadingBuilder';

export class DailyReportMarkdownBuilder {
  static build(
    summaries: NoteSummaries,
    dateStr: string,
    opts?: { enableChecklist?: boolean }
  ): string {
    const lines: string[] = [
      HeadingBuilder.create('note.report', {
        suffix: `（${dateStr})`,
      }),
      '',
    ];

    if (opts?.enableChecklist) {
      lines.push(
        '※ 以下の項目で正しくない内容をチェックし、レビュー欄に補足を追加してください。',
        ''
      );
    }

    const enableChecklist = opts?.enableChecklist ?? true;
    lines.push(
      summaries.summaryMarkdown({
        baseHeadingLevel: 4,
        checklist: enableChecklist,
        sentenceSplit: enableChecklist,
        withUserReview: enableChecklist,
      })
    );

    return lines.join('\n') + '\n';
  }
}
