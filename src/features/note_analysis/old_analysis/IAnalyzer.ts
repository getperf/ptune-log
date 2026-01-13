import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';

/**
 * Analyzer 共通インターフェース
 * - オプション型をジェネリックで受け取る
 * - デフォルトは「オプションなし」
 */
export interface IAnalyzer<TOptions = void> {
  analyze(summaries: NoteSummaries, options?: TOptions): Promise<void>;
}
