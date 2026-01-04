import { ReviewedNote } from "src/core/models/daily_notes/reviews/entities/ReviewedNote";

export class DailyReportReviewExtractor {
  extract(markdown: string): ReviewedNote[] {
    const lines = markdown.split(/\r?\n/);

    const results: ReviewedNote[] = [];

    let currentTitle: string | null = null;
    let checked: string[] = [];
    let reviews: string[] = [];
    let inUserReview = false;

    const flush = () => {
      if (!currentTitle) return;
      const note = new ReviewedNote(currentTitle, checked, reviews);
      if (!note.isEmpty()) results.push(note);
      checked = [];
      reviews = [];
      inUserReview = false;
    };

    for (const raw of lines) {
      const line = raw.trim();

      // ----- ノート見出し（#####）
      if (/^#####\s+/.test(line)) {
        flush();
        currentTitle = this.normalizeTitle(line);
        continue;
      }

      if (!currentTitle) continue;

      // ----- ユーザレビュー開始（######）
      if (/^######\s+/.test(line)) {
        inUserReview = true;
        continue;
      }

      // ----- チェック済み項目
      if (!inUserReview) {
        const m = line.match(/^-+\s*\[[xX]\]\s*(.+)$/);
        if (m) {
          checked.push(m[1].trim());
        }
        continue;
      }

      // ----- ユーザレビュー本文
      if (inUserReview) {
        if (line === '-' || line === '') continue;
        reviews.push(line.replace(/^-+\s*/, ''));
      }
    }

    flush();
    return results;
  }

  /** [[path|label]] → path */
  private normalizeTitle(line: string): string {
    const text = line.replace(/^#####\s+/, '');
    const m = text.match(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/);
    return m ? m[1].replace(/\.md$/, '') : text;
  }
}
