import { NoteSummary } from 'src/core/models/notes/NoteSummary';

export interface SummaryRenderOptions {
  baseHeadingLevel?: number; // 既定 2: ## ノート名
  checklist?: boolean; // true なら - [ ] 形式
  sentenceSplit?: boolean; // true ならセンテンス分割
  withLink?: boolean; // タイトルにリンク追加（既定: true）
}

export class NoteSummaryMarkdownBuilder {
  static render(note: NoteSummary, options: SummaryRenderOptions = {}): string {
    const {
      baseHeadingLevel = 2,
      checklist = false,
      sentenceSplit = false,
      withLink = true,
    } = options;

    const base = note.notePath.replace(/\.md$/, '').split('/').pop();
    const linkText = withLink
      ? `[[${note.notePath.replace(/\.md$/, '')}|${base}]]`
      : note.notePath.replace(/\.md$/, '');
    // const link = `[[${note.notePath.replace(/\.md$/, '')}|${base}]]`;
    const heading = '#'.repeat(baseHeadingLevel);

    const lines: string[] = [];
    lines.push(`${heading} ${linkText}`);

    const sentences = sentenceSplit
      ? note.summary
          .split(/(?<=[。．.!?])\s*/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [note.summary];

    const bullet = checklist ? '- [ ] ' : '- ';
    for (const s of sentences) {
      lines.push(`${bullet}${s}`);
    }

    if (note.goal) {
      lines.push(`${bullet}目標: ${note.goal}`);
    }

    return lines.join('\n');
  }
}
