// File: src/features/llm_tags/services/analysis/KPTExecutor.ts
import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';
import { logger } from 'src/core/services/logger/loggerInstance';
import { DailyNote } from 'src/core/models/daily_notes/DailyNote';
import { DailyReportReviewExtractor } from 'src/features/llm_tags/services/analysis/DailyReportReviewExtractor';
import { KptReviewSourceBuilder } from 'src/features/llm_tags/services/analysis/KptReviewSourceBuilder';
import { KptPhase } from './KptPhase';
import { KPTAnalyzer } from './KPTAnalyzer';

export interface KPTExecutionContext {
  summaries: NoteSummaries;
  dailyNote: DailyNote;
}

export class KPTExecutor {
  private readonly extractor = new DailyReportReviewExtractor();
  private readonly sourceBuilder = new KptReviewSourceBuilder();

  constructor(private readonly analyzer: KPTAnalyzer) { }

  async run(ctx: KPTExecutionContext): Promise<void> {
    const phase = this.determinePhase(ctx.dailyNote);
    const sourceText = this.buildSourceText(
      phase,
      ctx.summaries,
      ctx.dailyNote
    );
    const result = await this.analyzer.analyze({
      phase,
      sourceText,
    });
    ctx.summaries.setKptResult(result);
  }

  private buildSourceText(
    phase: KptPhase,
    summaries: NoteSummaries,
    dailyNote: DailyNote
  ): string {
    const base = summaries.summaryMarkdown({
      baseHeadingLevel: 2,
      withLink: false,
    });

    if (phase === KptPhase.First) {
      return base;
    }

    // 2回目以降：ユーザレビューをマージ
    if (!dailyNote.dailyReport) return base;

    const reviewNotes = this.extractor.extract(dailyNote.dailyReport);
    if (reviewNotes.length === 0) return base;

    const reviewText = this.sourceBuilder.build(reviewNotes);

    return [
      base,
      '',
      '---',
      '【2回目KPT分析用：ユーザレビュー】',
      '---',
      reviewText,
    ].join('\n');
  }

  private determinePhase(dailyNote: DailyNote): KptPhase {
    return dailyNote.hasKpt() ? KptPhase.Second : KptPhase.First;
  }

}
