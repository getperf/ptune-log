// src/features/daily_review/application/note_summary/DailyNoteSummaryUseCase.ts

import { App } from 'obsidian';
import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';
import { NoteSummaryDocumentBuilder } from '../../services/note_summary/NoteSummaryDocumentBuilder';
import {
  OutputFormat,
  ReportBuilderFactory,
} from '../../services/note_summary/ReportBuilderFactory';
import { SentenceMode } from '../DailyReviewRunOptions';

export class DailyNoteSummaryUseCase {
  constructor(private readonly app: App) {}

  async execute(
    summaries: NoteSummaries,
    options: {
      sentenceMode: SentenceMode;
      outputFormat: OutputFormat;
    },
  ): Promise<string> {
    const doc = await NoteSummaryDocumentBuilder.build(this.app, summaries);
    const builder = ReportBuilderFactory.create(options.outputFormat);
    return builder.build(doc);
  }
}
