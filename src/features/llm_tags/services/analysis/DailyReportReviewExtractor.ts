// src/features/llm_tags/services/analysis/DailyReportReviewExtractor.ts
import { ReviewedNote } from '../../../../core/models/daily_notes/reviews/ReviewedNote';

export class DailyReportReviewExtractor {
  extract(dailyReport: string): ReviewedNote[] {
    const lines = dailyReport.split(/\r?\n/);
    const result: ReviewedNote[] = [];

    let currentPath: string | null = null;
    let checked: string[] = [];
    let reviews: string[] = [];
    let inUserReview = false;

    const flush = () => {
      if (!currentPath) return;
      const note = new ReviewedNote(currentPath, checked, reviews);
      if (!note.isEmpty()) result.push(note);
      checked = [];
      reviews = [];
      inUserReview = false;
    };

    for (const raw of lines) {
      const line = raw.trim();

      if (line.startsWith('##### ')) {
        flush();
        currentPath = this.normalizeNotePath(line);
        continue;
      }

      if (!currentPath) continue;

      if (line.startsWith('###### ユーザレビュー')) {
        inUserReview = true;
        continue;
      }

      if (!inUserReview && line.startsWith('- [x]')) {
        checked.push(this.stripCheck(line));
        continue;
      }

      if (inUserReview && line.startsWith('- ')) {
        reviews.push(line.replace(/^-+\s*/, ''));
      }
    }

    flush();
    return result;
  }

  private normalizeNotePath(line: string): string {
    const head = line.replace(/^#####\s+/, '');
    const m = head.match(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/);
    return m ? m[1].replace(/\.md$/, '') : head;
  }

  private stripCheck(line: string): string {
    return line.replace(/^-+\s*\[x\]\s*/i, '').trim();
  }
}
