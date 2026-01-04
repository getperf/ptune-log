// tests/core/services/daily_notes/DailyReportReviewExtractor.test.ts

import { DailyReportReviewExtractor } from
  'src/features/llm_tags/services/analysis/DailyReportReviewExtractor';

describe('DailyReportReviewExtractor', () => {
  const extractor = new DailyReportReviewExtractor();

  it('extracts only notes with checked items or user reviews', () => {
    const markdown = `
### 🏷 デイリーレポート（2025-12-26)

##### [[_project/A|A]]
- [ ] not checked

###### ユーザレビュー
- 

##### [[_project/B|B]]
- [ ] foo
- [x] important decision

###### ユーザレビュー
- user comment B

##### [[_project/C|C]]
- [ ] foo
- [x] key insight

###### ユーザレビュー
- 
`;

    const result = extractor.extract(markdown);

    expect(result).toHaveLength(2);

    // --- B ---
    expect(result[0].notePath).toBe('_project/B');
    expect(result[0].checkedSummaries).toEqual([
      'important decision',
    ]);
    expect(result[0].userReviews).toEqual([
      'user comment B',
    ]);

    // --- C ---
    expect(result[1].notePath).toBe('_project/C');
    expect(result[1].checkedSummaries).toEqual([
      'key insight',
    ]);
    expect(result[1].userReviews).toEqual([]);
  });

  it('returns empty array when no user indications exist', () => {
    const markdown = `
##### [[_project/X|X]]
- [ ] foo
- [ ] bar
`;

    const result = extractor.extract(markdown);
    expect(result).toEqual([]);
  });
});
