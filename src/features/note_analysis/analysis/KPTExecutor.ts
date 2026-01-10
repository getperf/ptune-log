// src/features/llm_tags/services/analysis/KPTExecutor.ts

import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';
import { logger } from 'src/core/services/logger/loggerInstance';
import { DailyNoteOld } from 'src/core/models/daily_notes/DailyNoteOld';
import { DailyReportReviewExtractor } from './DailyReportReviewExtractor';
import { KptReviewSourceBuilder } from './KptReviewSourceBuilder';
import { KptPhase } from './KptPhase';
import { KPTAnalyzer } from './KPTAnalyzer';

export interface KPTExecutionContext {
  summaries: NoteSummaries;
  dailyNote: DailyNoteOld;
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

    logger.debug(`[KPTExecutor] create prompt, phase=${phase}\n${sourceText}`);

    const result = await this.analyzer.analyze({
      phase,
      sourceText,
    });

    ctx.summaries.setKptResult(result);
  }

  private buildSourceText(
    phase: KptPhase,
    summaries: NoteSummaries,
    dailyNote: DailyNoteOld
  ): string {
    const summary = summaries.summaryMarkdown({
      baseHeadingLevel: 2,
      withLink: false,
    });

    if (phase === KptPhase.First) {
      return summary;
    }

    const previousKpt = dailyNote.latestKpt();

    const userReviews = dailyNote.dailyReport
      ? this.extractor.extract(dailyNote.dailyReport) // ReviewNote[]
      : undefined;

    return this.sourceBuilder.build({
      summary,
      previousKpt,
      userReviews,
    });
  }

  private determinePhase(dailyNote: DailyNoteOld): KptPhase {
    return dailyNote.hasKpt() ? KptPhase.Second : KptPhase.First;
  }
}
