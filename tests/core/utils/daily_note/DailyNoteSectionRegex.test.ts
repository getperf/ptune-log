// src/core/utils/daily_notes/__tests__/DailyNoteSectionRegex.test.ts
import { DailyNoteSectionRegex } from 'src/core/utils/daily_note/DailyNoteSectionRegex';


describe('DailyNoteSectionRegex.isSectionBoundary', () => {
  test('## は境界', () => {
    expect(DailyNoteSectionRegex.isSectionBoundary('## セクション')).toBe(true);
  });

  test('### は ## の境界', () => {
    expect(DailyNoteSectionRegex.isSectionBoundary('### サブ')).toBe(true);
  });

  test('#### は本文扱い', () => {
    expect(DailyNoteSectionRegex.isSectionBoundary('#### 詳細')).toBe(false);
  });

  test('非見出しは false', () => {
    expect(DailyNoteSectionRegex.isSectionBoundary('本文')).toBe(false);
  });
});
