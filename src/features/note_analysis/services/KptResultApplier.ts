// File: src/features/note_analysis/services/KptResultApplier.ts

import { App } from 'obsidian';
import { DailyNote } from 'src/core/models/daily_notes/DailyNote';
import { DailyNoteWriter } from 'src/core/services/daily_notes/file_io/DailyNoteWriter';

export class KptResultApplier {
  private readonly writer: DailyNoteWriter;

  constructor(private readonly app: App) {
    this.writer = new DailyNoteWriter(app);
  }

  async apply(dailyNote: DailyNote): Promise<void> {
    const testKptMarkdown = `
## 🧠 KPT分析（テスト）

### Keep
- レビュー導線の設計方針を整理できた

### Problem
- 抽出仕様が未実装のため検証不足

### Try
- 次回は抽出ロジックを実装し、実データで検証する
`.trim();

    const updated = dailyNote.appendKpt(testKptMarkdown, 'SUFFIX', 'first');
    await this.writer.writeToActive(updated);
  }
}
