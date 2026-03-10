// src/features/daily_review/infrastructure/note_summary/builders/XMindReportBuilder.ts

import { wrapWithCodeBlock } from 'src/core/utils/markdown/CodeBlockUtil';
import { MarkdownCommentBlock } from 'src/core/utils/markdown/MarkdownCommentBlock';
import { NoteSummaryDocument } from '../../../domain/models/NoteSummaryDocument';
import { ReportBuilder } from '../../../domain/ports/ReportBuilder';
import { getText } from '../../../i18n/comment';

import { App, normalizePath } from 'obsidian';

export class XMindReportBuilder implements ReportBuilder {
  constructor(private readonly app: App) {}

  build(doc: NoteSummaryDocument): string {
    const blocks: string[] = [];

    const header = MarkdownCommentBlock.build(
      getText('review-point-action-comment'),
    );

    blocks.push(header);

    // XMind file
    const xmindFile = this.ensureXmindFile();

    if (xmindFile) {
      blocks.push(`[XMindを開く](${xmindFile})`);
    }

    blocks.push(`#### ${getText('xmind-input-heading')}`);

    const inputText = this.buildInputText(doc);

    blocks.push(wrapWithCodeBlock(inputText, 'text'));

    blocks.push(`#### ${getText('xmind-output-heading')}`);

    blocks.push(wrapWithCodeBlock('', 'text'));

    return blocks.join('\n\n');
  }

  private ensureXmindFile(): string | null {
    const file = this.app.workspace.getActiveFile();

    if (!file || !file.parent) {
      return null;
    }

    const base = file.basename;

    const fileName = `${base}-analysis.xmind`;

    const xmindPath = normalizePath(`${file.parent.path}/${fileName}`);

    const exists = this.app.vault.getAbstractFileByPath(xmindPath);

    if (exists) {
      return fileName;
    }

    try {
      const template = `${this.app.vault.configDir}/plugins/ptune-log/assets/template_analysis.xmind`;

      const data = this.app.vault.adapter.readBinary(template);

      data.then((buf) => {
        this.app.vault.adapter.writeBinary(xmindPath, buf);
      });
    } catch (e) {
      console.error('XMind template copy failed', e);
    }

    return fileName;
  }

  private buildInputText(doc: NoteSummaryDocument): string {
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

    return lines.join('\n');
  }
}
