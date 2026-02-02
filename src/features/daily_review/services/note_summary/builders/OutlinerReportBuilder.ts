// src/features/daily_review/services/note_summary/builders/OutlinerReportBuilder.ts

import { NoteSummaryDocument } from '../../../model/NoteSummaryDocument';
import { ReportBuilder } from '../ReportBuilder';

export class OutlinerReportBuilder implements ReportBuilder {
  build(doc: NoteSummaryDocument): string {
    const lines: string[] = [];

    for (const project of doc.projects) {
      lines.push(`#### ${project.projectPath}`);

      for (const note of project.notes) {
        lines.push(`##### ${note.noteLink}`);
        for (const s of note.sentences) {
          lines.push(`- ${s.text}`);
        }
      }
    }

    return lines.join('\n');
  }
}
