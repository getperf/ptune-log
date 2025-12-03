// File: src/core/services/notes/DailyNoteUpdater.ts
import { App, Notice, TFile, moment } from 'obsidian';
import { createDailyNote } from 'obsidian-daily-notes-interface';
import { DailyNoteHelper } from 'src/core/utils/daily_note/DailyNoteHelper';
import { DailyNoteConfig } from 'src/core/utils/daily_note/DailyNoteConfig';
import { logger } from 'src/core/services/logger/loggerInstance';
import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';
import { DateUtil } from 'src/core/utils/date/DateUtil';
import { KPTMarkdownBuilder } from 'src/features/llm_tags/services/analysis/KPTMarkdownBuilder';
import { ChecklistDecorator } from './ChecklistDecorator';

export interface AppendOptions {
  headingMarker?: string;
  prepend?: boolean;
  reverse?: boolean;
  enableChecklist?: boolean;
}

export const HEADER_REVIEW_LOG = '## 🙌 振り返りメモ';

const DEFAULT_OPTIONS: AppendOptions = {
  headingMarker: HEADER_REVIEW_LOG,
  prepend: false,
  reverse: true,
  enableChecklist: true,
};

/**
 * --- DailyNoteUpdater
 * LLM解析結果などから構成された NoteSummaries をデイリーノートに追記するサービス。
 * - core/services 配下に移動し、LLM に依存しない汎用ノート更新機能として扱う。
 */
export class DailyNoteUpdater {
  /** --- constructor
   * App インスタンスを受け取り、デイリーノート操作に利用する。
   */
  constructor(private readonly app: App) { }

  /** --- appendTagResults
   * NoteSummaries を指定日のデイリーノートに追記する。
   * - headingMarker セクション配下にMarkdownを追記
   * - 失敗時は Notice とログを出力
   */
  async appendTagResults(
    summaries: NoteSummaries,
    forDate: Date,
    opts: AppendOptions = {}
  ): Promise<void> {
    const options = { ...DEFAULT_OPTIONS, ...opts };
    logger.info(
      `[DailyNoteUpdater.appendTagResults] start date=${DateUtil.dateKey(
        forDate
      )}`
    );

    let note: TFile;
    try {
      note = await DailyNoteHelper.getOrOpenDailyNoteForDate(this.app, forDate);
    } catch (e) {
      logger.error('[DailyNoteUpdater] failed to open daily note', e);
      new Notice('📝 デイリーノート取得に失敗しました。');
      return;
    }

    const summaryText = await this.buildSummaryText(
      summaries,
      forDate,
      options
    );

    try {
      await DailyNoteHelper.appendToSection(
        this.app,
        note,
        options.headingMarker!,
        summaryText,
        options.prepend
      );
      logger.info('[DailyNoteUpdater] summary appended');
    } catch (e) {
      logger.error('[DailyNoteUpdater] failed to append summary', e);
      new Notice('⚠️ デイリーノートへの追記に失敗しました。');
    }
  }

  /** --- buildSummaryText
   * NoteSummaries からフォルダ単位レポートをMarkdownで生成する。
   * - ノートごとの要約とタグの一覧を出力
   * - 当日生成タグ／未登録タグ候補もまとめて表示
   */

  /** --- buildSummaryText */
  async buildSummaryText(
    summaries: NoteSummaries,
    forDate: Date,
    opts: AppendOptions
  ): Promise<string> {
    const dateStr = DateUtil.localDate(forDate);
    const allTags = summaries.getAllTags();
    const newTags = summaries.getAllNewCandidates();
    const folders = summaries.getFoldersSorted();
    logger.debug(
      `[DailyNoteUpdater.buildSummaryText] folders=${folders.length} tags=${allTags.length}`
    );
    const enableChecklist = opts.enableChecklist ?? true;

    /** ✔ チェックボックス付与関数 */
    const decorator = new ChecklistDecorator(
      opts.enableChecklist ?? true,
      '- [ ] '
    );

    const lines: string[] = [
      `### 🏷 デイリーレポート（${dateStr}）`,
      '',
      enableChecklist
        ? '※ 以下の項目はチェックし、必要に応じて修正してください。'
        : '',
      '',
    ];

    for (const folder of folders) {
      lines.push(`\n#### ${folder.noteFolder}`);

      const commonTags = (await folder.getCommonTags(this.app)) ?? [];
      if (commonTags.length > 0) {
        const tagLine = `共通タグ: ${commonTags.map((t) => `#${t}`).join(' ')}`;
        lines.push(tagLine);
      }

      const notes = folder.getNotes().sort((a, b) => {
        const getNum = (s: string) => parseInt(s.split('_')[0]) || 0;
        return getNum(a.notePath) - getNum(b.notePath);
      });

      for (const note of notes) {
        const md = note.toMarkdownSummary(); // 複数行のこともある

        const mdLines = md.split('\n').map((ln) => decorator.apply(ln));
        lines.push(mdLines.join('\n'));
      }
    }

    // --- KPT セクション
    if (summaries.kpt) {
      lines.push('\n');
      lines.push(KPTMarkdownBuilder.build(summaries.kpt));
    }

    lines.push(
      `\n\n### 📌 タグ一覧（当日生成）\n${allTags
        .map((t) => `#${t}`)
        .join(' ')}`
    );

    if (newTags.length > 0) {
      lines.push(
        `\n\n### ⚠ 未登録タグ候補（要レビュー）\n${newTags
          .map((t) => `#${t}`)
          .join(' ')}`
      );
    }

    logger.debug('[DailyNoteUpdater.buildSummaryText] complete');
    return lines.join('\n') + '\n';
  }

  /** 
   * DailyNoteConfig を利用して日付に対応するデイリーノートを取得し、
   * 未作成の場合は obsidian-daily-notes-interface により作成する。
   */
  async getOrCreateDailyNote(date: Date): Promise<TFile | null> {
    const path = await DailyNoteConfig.getNotePathForDate(this.app.vault, date);
    if (!path) return null;

    const file = this.app.vault.getAbstractFileByPath(path);
    if (file instanceof TFile) return file;

    const m = moment as unknown as (d: unknown) => moment.Moment;
    return await createDailyNote(m(date));
  }
}
