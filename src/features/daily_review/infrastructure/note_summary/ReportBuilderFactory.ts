// src/features/daily_review/services/note_summary/ReportBuilderFactory.ts

import { OutlinerReportBuilder } from './builders/OutlinerReportBuilder';
import { ReportBuilder } from '../../domain/ports/ReportBuilder';
import { XMindReportBuilder } from './builders/XMindReportBuilder';
import { App } from 'obsidian';

export type OutputFormat = 'outliner' | 'xmind';

export class ReportBuilderFactory {
  static create(format: OutputFormat, app: App): ReportBuilder {
    switch (format) {
      case 'xmind':
        return new XMindReportBuilder(app);
      case 'outliner':
      default:
        return new OutlinerReportBuilder();
    }
  }
}
