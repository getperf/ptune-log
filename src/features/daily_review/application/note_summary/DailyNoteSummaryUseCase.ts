// src/features/daily_review/application/note_summary/DailyNoteSummaryUseCase.ts

import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';
import { NoteSummaryDocumentBuilder } from '../../services/note_summary/NoteSummaryDocumentBuilder';
import {
  OutputFormat,
  ReportBuilderFactory,
} from '../../services/note_summary/ReportBuilderFactory';
import { SentenceMode } from '../DailyReviewRunOptions';

export class DailyNoteSummaryUseCase {
  execute(
    summaries: NoteSummaries,
    options: {
      sentenceMode: SentenceMode;
      outputFormat: OutputFormat;
    },
  ): string {
    const doc = NoteSummaryDocumentBuilder.build(summaries);
    const builder = ReportBuilderFactory.create(options.outputFormat);
    return builder.build(doc);
  }
}
