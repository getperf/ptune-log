// File: src/features/daily_review/services/kpt/formatters/KptMarkdownFormatter.ts

import { KptOutputFormatter } from './KptOutputFormatter';
import { KPTResult } from 'src/core/models/daily_notes/KPTResult';
import { KptMarkdownConverter } from '../builders/KptMarkdownConverter';

export class KptMarkdownFormatter implements KptOutputFormatter {
  format(result: KPTResult): string {
    return KptMarkdownConverter.convert(result);
  }
}
