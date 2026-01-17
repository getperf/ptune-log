// File: src/features/daily_review/services/kpt/formatters/KptMindmapTextFormatter.ts

import { wrapWithCodeBlock } from 'src/core/utils/markdown/CodeBlockUtil';
import { KptOutputFormatter } from './KptOutputFormatter';
import { KPTResult } from 'src/core/models/daily_notes/KPTResult';

export class KptMindmapTextFormatter implements KptOutputFormatter {
  format(result: KPTResult): string {
    const lines: string[] = [];

    const appendSection = (title: string, items: string[]) => {
      if (items.length === 0) return;
      lines.push(title);
      for (const item of items) {
        lines.push(`\t${item}`);
      }
    };

    appendSection('Keep', result.Keep);
    appendSection('Problem', result.Problem);
    appendSection('Try', result.Try);

    const text = lines.join('\n');
    return wrapWithCodeBlock(text, 'text');
  }
}
