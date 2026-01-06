// File: src/core/services/notes/DailyNoteTaskKeyExtractor.ts

import { TFile, App } from 'obsidian';
import { TaskKeyGenerator, ParsedTask } from 'src/core/services/tasks/TaskKeyGenerator';
import { FileUtils } from 'src/core/utils/common/FileUtils';

interface ParsedTaskLine {
  indent: number;
  title: string;
  parentTitle?: string;
}

export class DailyNoteTaskKeyExtractor {
  constructor(private readonly app: App) { }

  async extract(file: TFile): Promise<string[]> {
    // --- 「今日の予定タスク」セクションのみ取得 ---
    const lines = await FileUtils.readSection(
      this.app,
      file,
      '今日の予定タスク'
    );

    const parsedLines: ParsedTaskLine[] = [];

    // --- チェックリスト行のみ抽出 ---
    for (const line of lines) {
      const m = line.match(/^(\s*)- \[[ xX]\] (.+)$/);
      if (!m) continue;

      parsedLines.push({
        indent: m[1].length,
        title: m[2].trim(),
      });
    }

    const taskKeys: string[] = [];
    let currentParentTitle: string | undefined;

    // --- 親子判定結果を ParsedTaskLine に反映 ---
    for (const line of parsedLines) {
      if (line.indent === 0) {
        currentParentTitle = line.title;
        line.parentTitle = undefined;
      } else {
        line.parentTitle = currentParentTitle;
      }

      const parsedTask: ParsedTask = {
        title: line.title,
        parentTitle: line.parentTitle,
      };

      taskKeys.push(
        TaskKeyGenerator.createByParsedTask(parsedTask)
      );
    }

    return taskKeys;
  }
}
