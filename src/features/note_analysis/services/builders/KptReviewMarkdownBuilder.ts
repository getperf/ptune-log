// src/features/note_analysis/services/builders/KptReviewMarkdownBuilder.ts

import { ReviewedNote } from 'src/core/models/daily_notes/ReviewedNote';

export class KptReviewMarkdownBuilder {
  static build(notes: ReviewedNote[]): string {
    return notes
      .map((note) => {
        const body = note.lines.map((l) => `- ${l.type}: ${l.text}`);

        return [`### ${note.path}`, ...body].join('\n');
      })
      .join('\n\n')
      .trim();
  }
}
