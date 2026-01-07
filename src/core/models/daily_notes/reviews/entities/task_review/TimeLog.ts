import { SectionOld } from '../SectionOld';

/**
 * TimeLog
 * - 1回の時間集計・分析結果を表す
 * - 生成ロジックは一切持たない
 */
export class TimeLog {
  constructor(
    /** レポート全体の Markdown（中身は自由） */
    public readonly report: SectionOld<void>,
    /** 再生成単位を識別したい場合のみ */
    public readonly label?: string
  ) {}
}
