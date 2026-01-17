// File: src/features/daily_review/services/kpt/formatters/KptOutputFormatterFactory.ts

import { KptOutputFormatter } from './KptOutputFormatter';
import { KptMarkdownFormatter } from './KptMarkdownFormatter';
import { KptMindmapTextFormatter } from './KptMindmapTextFormatter';
import { KptOutputMode } from 'src/config/settings/ReviewSettings';

export class KptOutputFormatterFactory {
  static create(mode: KptOutputMode): KptOutputFormatter {
    switch (mode) {
      case 'text':
        return new KptMindmapTextFormatter();
      case 'markdown':
      default:
        return new KptMarkdownFormatter();
    }
  }
}
