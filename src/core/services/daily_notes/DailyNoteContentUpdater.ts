// src/core/daily_note/updater/DailyNoteContentUpdater.ts

import type { NoteSummaries } from 'src/core/models/notes/NoteSummaries';

export interface AppendOptions {
  enableChecklist?: boolean;
}

const HEADER_REVIEW_LOG = '## 🙌 振り返りメモ';
const HEADER_DAILY_REPORT_PREFIX = '### 🏷 デイリーレポート';
const HEADER_TAG_LIST = '### 📌 タグ一覧（当日生成）';

export class DailyNoteContentUpdater {
  /**
   * === Pure function ===
   * - I/O を一切含まない
   * - テスト対象
   */
  static updateContent(
    content: string,
    summaries: NoteSummaries,
    dateStr: string,
    opts: AppendOptions = {}
  ): string {
    let updated = content;

    // --- デイリーレポート（初回のみ） ---
    if (!this.hasDailyReport(updated, dateStr)) {
      const reportBlock = this.buildDailyReportBlock(summaries, dateStr, opts);
      updated = this.insertUnderReviewHeader(updated, reportBlock);
    }

    // --- タグ一覧（初回のみ） ---
    if (!this.hasTagList(updated)) {
      const tagBlock = this.buildTagListBlock(summaries);
      updated = this.insertUnderReviewHeader(updated, tagBlock);
    }

    return updated;
  }

  /* ===== helpers ===== */

  private static hasDailyReport(content: string, dateStr: string): boolean {
    return content.includes(`${HEADER_DAILY_REPORT_PREFIX}（${dateStr})`);
  }

  private static hasTagList(content: string): boolean {
    return content.includes(HEADER_TAG_LIST);
  }

  private static insertUnderReviewHeader(
    content: string,
    block: string
  ): string {
    const idx = content.indexOf(HEADER_REVIEW_LOG);
    if (idx === -1) return content;

    const insertPos = idx + HEADER_REVIEW_LOG.length;
    return (
      content.slice(0, insertPos) +
      '\n\n' +
      block +
      '\n' +
      content.slice(insertPos)
    );
  }

  private static buildDailyReportBlock(
    summaries: NoteSummaries,
    dateStr: string,
    opts: AppendOptions
  ): string {
    const lines: string[] = [
      `${HEADER_DAILY_REPORT_PREFIX}（${dateStr})`,
      '',
      opts.enableChecklist
        ? '※ 以下の項目で正しくない内容をチェックし、レビュー欄に補足を追加してください。'
        : '',
      summaries.summaryMarkdown({
        baseHeadingLevel: 4,
        checklist: opts.enableChecklist,
        sentenceSplit: opts.enableChecklist,
        withUserReview: opts.enableChecklist,
      }),
    ];

    return lines.filter(Boolean).join('\n') + '\n';
  }

  private static buildTagListBlock(summaries: NoteSummaries): string {
    const allTags = summaries.getAllTags();
    const newTags = summaries.getAllUnregisteredTags();

    const lines: string[] = [
      HEADER_TAG_LIST,
      allTags.map((t) => `#${t}`).join(' '),
    ];

    if (newTags.length > 0) {
      lines.push(
        '',
        '### ⚠ 未登録タグ候補（要レビュー）',
        '',
        newTags.map((t) => `#${t}`).join(' ')
      );
    }

    return lines.join('\n') + '\n';
  }
}
