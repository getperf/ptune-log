// src/features/daily_review/services/note_summary/NoteSummaryDocumentBuilder.ts

import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';
import { NoteSummary } from 'src/core/models/notes/NoteSummary';
import { NoteSummaryMarkdownBuilder } from 'src/core/services/notes/NoteSummaryMarkdownBuilder';
import {
  NoteNode,
  NoteSummaryDocument,
  ProjectNode,
  Sentence,
} from '../../model/NoteSummaryDocument';

export class NoteSummaryDocumentBuilder {
  static build(summaries: NoteSummaries): NoteSummaryDocument {
    const projects: ProjectNode[] = [];

    for (const folder of summaries.getFoldersSorted()) {
      const notes: NoteNode[] = [];

      for (const note of folder.getNotes()) {
        const sentences = this.extractSentences(note);

        notes.push({
          notePath: note.notePath,
          noteLink: `[[${note.notePath.replace(/\.md$/, '')}]]`,
          sentences,
        });
      }

      projects.push({
        projectPath: folder.noteFolder,
        notes,
      });
    }

    return { projects };
  }

  /**
   * NoteSummaryMarkdownBuilder のセンテンス分割ロジックを再利用
   */
  private static extractSentences(note: NoteSummary): Sentence[] {
    // checklist=false, sentenceSplit=true で bullet list を生成
    const lines = NoteSummaryMarkdownBuilder.renderSummary(note, {
      checklist: false,
      sentenceSplit: true,
      bullet: false,
    });

    return lines.map((line) => ({ text: line }));
  }
}
