import { Section } from './Section';

/**
 * TimeLog
 * - 1回の時間集計・分析結果を表す
 * - 生成ロジックは一切持たない
 */
export class TimeLog {
  constructor(
    public readonly timeTable: Section<void>,
    public readonly backlog: Section<void>,
    public readonly timeAnalysis: Section<void>
  ) { }

  /** 表示順で Section を列挙 */
  getSections(): Section<void>[] {
    return [this.timeTable, this.backlog, this.timeAnalysis];
  }

  /** 表示用 Markdown（空 Section は除外） */
  toMarkdown(level = 3): string {
    return this.getSections()
      .filter(section => !section.isEmpty())
      .map(section => section.toMarkdown(level))
      .join('\n\n');
  }
}
