// tests/core/services/daily_notes/DailyNoteSectionParser.test.ts

import { DailyNoteSectionParser } from 'src/core/services/daily_notes/parse/DailyNoteSectionParser';

const MD = `
## 🧠 KPT分析
- keep A
#### 詳細メモ
- keep B

### 🧠 KPT分析(2)
- keep C

## タスク振り返り
- row 1
`;

describe('DailyNoteSectionParser.extractAll', () => {
  test('### は ## の境界として分割される', () => {
    const res = DailyNoteSectionParser.extractAll(MD, 'KPT分析');
    expect(res.length).toBe(2);
    expect(res[0]).toContain('keep A');
    expect(res[0]).toContain('詳細メモ');
    expect(res[1]).toContain('keep C');
  });

  test('#### は本文として含まれる', () => {
    const res = DailyNoteSectionParser.extractAll(MD, 'KPT分析');
    expect(res[0]).toContain('#### 詳細メモ');
  });

  test('存在しない見出しは空配列', () => {
    const res = DailyNoteSectionParser.extractAll(MD, '存在しない');
    expect(res.length).toBe(0);
  });
});
