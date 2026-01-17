// File: src/features/daily_review/services/kpt/formatters/KptOutputFormatter.ts

import { KPTResult } from 'src/core/models/daily_notes/KPTResult';

export interface KptOutputFormatter {
  format(result: KPTResult): string;
}
