import { SectionParser } from 'src/core/services/daily_notes/SectionParser';
import { ja } from 'src/i18n/domain/daily_note/ja';

const markdown = `
## ✅ 今日の予定タスク（手動で追記OK）
- task A

## 🕒 タイムログ／メモ
### タスク振り返り (2026-01-03)
TABLE-1

#### ⏱ 時間分析サマリ（LLM）
ANALYSIS-1

### タスク振り返り (2026-01-03)
TABLE-2

#### 未完了タスク
BACKLOG-2

## 🙌 振り返りメモ
MEMO

### 🏷 デイリーレポート（2026-01-03)
REPORT

### 🧠 KPT分析
KPT-1

### 🧠 KPT分析(2)
KPT-2
`.trim();

describe('SectionParser with repeatable task.review', () => {
  test('extracts task.review as repeatable section', () => {
    const parser = new SectionParser(ja); // ✅ 1 引数

    const sections = parser.parse(markdown);

    expect(sections.map((s) => s.key)).toEqual([
      'task.planned',
      'task.timelog',
      'task.review',
      'task.review',
      'note.review.memo',
      'note.report',
      'note.kpt',
      'note.kpt',
    ]);
  });

  test('each task.review body is isolated', () => {
    const parser = new SectionParser(ja);

    const reviews = parser
      .parse(markdown)
      .filter((s) => s.key === 'task.review');

    expect(reviews).toHaveLength(2);
    expect(reviews[0].body).toContain('TABLE-1');
    expect(reviews[0].body).toContain('ANALYSIS-1');

    expect(reviews[1].body).toContain('TABLE-2');
    expect(reviews[1].body).toContain('BACKLOG-2');
  });
});
