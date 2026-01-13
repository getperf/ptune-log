// src/features/note_analysis/services/extractors/DailyReportReviewExtractor.ts

import {
  ReviewedNote,
  ReviewLine,
} from 'src/core/models/daily_notes/ReviewedNote';

export class DailyReportReviewExtractor {
  extract(markdown: string): ReviewedNote[] {
    const lines = markdown.split(/\r?\n/);
    const results: ReviewedNote[] = [];

    let currentPath: string | null = null;
    let currentTitle: string | null = null;
    let currentLines: ReviewLine[] = [];
    let inUserReview = false;

    const flush = () => {
      if (!currentPath || !currentTitle) return;
      if (currentLines.length === 0) return;

      results.push(new ReviewedNote(currentPath, currentTitle, currentLines));
      currentLines = [];
      inUserReview = false;
    };

    for (const raw of lines) {
      const line = raw.trim();

      // ----- ノート見出し
      if (/^#####\s+/.test(line)) {
        flush();
        const { path, title } = this.parseTitle(line);
        currentPath = path;
        currentTitle = title;
        continue;
      }

      if (!currentPath) continue;

      // ----- レビュー開始
      if (/^######\s+/.test(line)) {
        inUserReview = true;
        continue;
      }

      // ----- チェック項目
      if (!inUserReview) {
        const checked = line.match(/^-+\s*\[[xX]\]\s*(.+)$/);
        if (checked) {
          currentLines.push({ type: 'REJECTED', text: checked[1].trim() });
          continue;
        }

        const unchecked = line.match(/^-+\s*\[\s*\]\s*(.+)$/);
        if (unchecked) {
          currentLines.push({ type: 'ACCEPTED', text: unchecked[1].trim() });
          continue;
        }
        continue;
      }

      // ----- ユーザコメント
      if (inUserReview) {
        if (line === '-' || line === '') continue;
        currentLines.push({
          type: 'USERCOMMENT',
          text: line.replace(/^-+\s*/, ''),
        });
      }
    }

    flush();
    return results;
  }

  private parseTitle(line: string): { path: string; title: string } {
    const text = line.replace(/^#####\s+/, '');
    const m = text.match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);

    if (!m) {
      return { path: text, title: text };
    }

    return {
      path: m[1].replace(/\.md$/, ''),
      title: m[2] ?? m[1],
    };
  }
}
