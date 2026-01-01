// File: src/core/services/notes/DailyNoteUpdater.ts
import { App } from 'obsidian';
import { DailyNoteHelper } from 'src/core/utils/daily_note/DailyNoteHelper';
import { logger } from 'src/core/services/logger/loggerInstance';
import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';
import { DateUtil } from 'src/core/utils/date/DateUtil';
import { KPTMarkdownBuilder } from 'src/features/llm_tags/services/analysis/KPTMarkdownBuilder';

/* ===== 既存 API を維持 ===== */

export interface AppendOptions {
  headingMarker?: string;
  prepend?: boolean;
  reverse?: boolean;
  enableChecklist?: boolean;
}

export const HEADER_REVIEW_LOG = '## 🙌 振り返りメモ';
const HEADER_DAILY_REPORT_PREFIX = '### 🏷 デイリーレポート';
const HEADER_TAG_LIST = '### 📌 タグ一覧（当日生成）';

export class DailyNoteUpdater {
  constructor(private readonly app: App) { }

  /**
   * === メインエントリ ===
   * - サマリ／タグ：初回のみ生成
   * - KPT：毎回追記
   */
  async update(
    summaries: NoteSummaries,
    forDate: Date,
    opts: AppendOptions = {}
  ): Promise<void> {
    const note = await DailyNoteHelper.getOrOpenDailyNoteForDate(
      this.app,
      forDate
    );

    const dateStr = DateUtil.localDate(forDate);
    const content = await this.app.vault.read(note);

    let updated = content;

    // --- サマリレポート（初回のみ） ---
    if (!this.hasDailyReport(content, dateStr)) {
      const reportBlock = await this.buildDailyReportBlock(
        summaries,
        forDate,
        opts
      );
      updated = this.insertUnderReviewHeader(updated, reportBlock);
    }

    // --- タグ一覧（初回のみ） ---
    if (!this.hasTagList(updated)) {
      const tagBlock = this.buildTagListBlock(summaries);
      updated = this.insertUnderReviewHeader(updated, tagBlock);
    }

    // --- KPT（毎回追記） ---
    if (summaries.kpt) {
      const index = this.nextKptIndex(updated);
      updated =
        updated.trimEnd() +
        '\n\n' +
        KPTMarkdownBuilder.build(summaries.kpt, index > 1 ? index : undefined) +
        '\n';
    }

    if (updated !== content) {
      await this.app.vault.modify(note, updated);
      logger.info('[DailyNoteUpdater] review note updated');
    }
  }

  /* ===== private helpers ===== */

  private hasDailyReport(content: string, dateStr: string): boolean {
    return content.includes(`${HEADER_DAILY_REPORT_PREFIX}（${dateStr})`);
  }

  private hasTagList(content: string): boolean {
    return content.includes(HEADER_TAG_LIST);
  }

  private nextKptIndex(content: string): number {
    const matches = content.match(/### 🧠 KPT分析(\((\d+)\))?/g);
    return matches ? matches.length + 1 : 1;
  }

  private insertUnderReviewHeader(content: string, block: string): string {
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

  private async buildDailyReportBlock(
    summaries: NoteSummaries,
    forDate: Date,
    opts: AppendOptions
  ): Promise<string> {
    const dateStr = DateUtil.localDate(forDate);

    const lines: string[] = [
      `${HEADER_DAILY_REPORT_PREFIX}（${dateStr})`,
      '',
      opts.enableChecklist
        ? '※ 以下の項目で正しくない内容をチェックし、レビュー欄に補足を追加してから、' +
        '振り返りを再実行してください。内容を補足してKPT分析を再実行します。'
        : '',
    ];

    const useUserReivew = opts.enableChecklist;
    lines.push(
      summaries.summaryMarkdown({
        baseHeadingLevel: 4,
        checklist: useUserReivew,
        sentenceSplit: useUserReivew,
        withUserReview: useUserReivew,
      })
    );

    return lines.join('\n') + '\n';
  }

  private buildTagListBlock(summaries: NoteSummaries): string {
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
        '※ 未登録タグがあります。',
        '→ コマンド「**エイリアス辞書にタグを登録・マージ**」で既存タグとの名寄せを行ってください。',
        '',
        newTags.map((t) => `#${t}`).join(' ')
      );
    }

    return lines.join('\n') + '\n';
  }
}
