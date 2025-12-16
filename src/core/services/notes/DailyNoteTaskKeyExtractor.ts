// File: src/core/services/notes/DailyNoteTaskKeyExtractor.ts

import { TFile, App } from 'obsidian';
import { TaskKeyGenerator } from 'src/core/services/tasks/TaskKeyGenerator';
import { FileUtils } from 'src/core/utils/common/FileUtils';

interface ParsedTaskLine {
  indent: number;
  title: string;
}

export class DailyNoteTaskKeyExtractor {
  constructor(private readonly app: App) {}

  async extract(file: TFile): Promise<string[]> {
    // --- 「今日の予定タスク」セクションのみ取得 ---
    const lines = await FileUtils.readSection(
      this.app,
      file,
      '今日の予定タスク'
    );

    const tasks: ParsedTaskLine[] = [];

    // --- チェックリスト行のみ抽出 ---
    for (const line of lines) {
      const m = line.match(/^(\s*)- \[[ xX]\] (.+)$/);
      if (!m) continue;

      tasks.push({
        indent: m[1].length,
        title: m[2].trim(),
      });
    }

    const taskKeys: string[] = [];
    let currentParentKey: string | null = null;

    // --- 親子判定（インデント + prefix 規約） ---
    for (const task of tasks) {
      const baseKey = TaskKeyGenerator.generate(task.title);

      // 親タスク：インデント 0
      if (task.indent === 0) {
        taskKeys.push(baseKey);
        currentParentKey = baseKey;
        continue;
      }

      // 子タスク：直前の親にぶら下げる
      if (currentParentKey) {
        taskKeys.push(
          TaskKeyGenerator.generateChild(currentParentKey, task.title)
        );
        continue;
      }

      // フォールバック（理論上ほぼ起きない）
      taskKeys.push(baseKey);
    }

    return taskKeys;
  }
}
