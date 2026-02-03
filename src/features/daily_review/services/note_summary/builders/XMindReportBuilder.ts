// src/features/daily_review/services/note_summary/builders/XMindReportBuilder.ts

import { wrapWithCodeBlock } from 'src/core/utils/markdown/CodeBlockUtil';
import { NoteSummaryDocument } from '../../../model/NoteSummaryDocument';
import { ReportBuilder } from '../ReportBuilder';

export class XMindReportBuilder implements ReportBuilder {
  build(doc: NoteSummaryDocument): string {
    const lines: string[] = [];

    for (const project of doc.projects) {
      lines.push(project.projectTitle);

      for (const note of project.notes) {
        lines.push(`\t${note.noteTitle}`);
        for (const s of note.sentences) {
          lines.push(`\t\t${s.text}`);
        }
      }
    }

    const text = lines.join('\n');
    return wrapWithCodeBlock(text, 'text');
  }
}
