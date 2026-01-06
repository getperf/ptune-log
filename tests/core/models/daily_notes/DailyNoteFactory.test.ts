// tests/core/models/daily_notes/DailyNoteFactory.test.ts
import { SectionParser } from 'src/core/services/daily_notes/SectionParser';
import { DailyNoteFactory } from 'src/core/models/daily_notes/reviews/factories/DailyNoteFactory';
import { ja } from 'src/i18n/domain/daily_note/ja';

const markdown = `
## ✅ 今日の予定タスク（手動で追記OK）
- task A
- task B

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
##### [[_project/A]]
- [x] done A

###### ユーザレビュー
- review A

### 🧠 KPT分析
KPT-1

### 🧠 KPT分析(2)
KPT-2
`.trim();

describe('DailyNoteFactory (integration)', () => {
  test('build DailyNote from realistic markdown', () => {
    const parser = new SectionParser(ja);
    const factory = new DailyNoteFactory(parser);

    const dailyNote = factory.fromMarkdown(markdown); // ✅ instance 呼び出し

    // ===== TaskReview =====
    const taskReview = dailyNote.taskReview;

    expect(taskReview.plannedTasks.markdown).toContain('task A');
    expect(taskReview.timeLogs).toHaveLength(2);

    expect(taskReview.timeLogs[0].report.markdown).toContain('TABLE-1');
    expect(taskReview.timeLogs[0].report.markdown).toContain('ANALYSIS-1');

    expect(taskReview.timeLogs[1].report.markdown).toContain('TABLE-2');
    expect(taskReview.timeLogs[1].report.markdown).toContain('BACKLOG-2');

    // ===== NoteReview =====
    const noteReview = dailyNote.noteReview;

    expect(noteReview.dailyTags.markdown).toContain('MEMO');

    const report = noteReview.dailyReport;
    expect(report.reviewedNotes).toHaveLength(1);

    const reviewed = report.reviewedNotes[0];
    expect(reviewed.notePath).toBe('_project/A');
    expect(reviewed.checkedSummaries[0]).toContain('done A');
    expect(reviewed.userReviews[0]).toContain('review A');

    expect(noteReview.kpts).toHaveLength(2);
  });
});
