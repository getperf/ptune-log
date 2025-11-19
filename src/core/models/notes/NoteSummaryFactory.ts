// File: src/core/models/notes/NoteSummaryFactory.ts
import { App, TFile } from 'obsidian';
import { NoteSummary } from 'src/core/models/notes/NoteSummary';
import { logger } from 'src/core/services/logger/loggerInstance';

/**
 * --- NoteSummaryFactory
 * NoteSummary の生成ロジックを集約するファクトリクラス。
 * - LLMタグ生成後のフロントマターから NoteSummary を構築
 * - 既存ノートのフロントマターからの再構築にも利用可能
 */
export class NoteSummaryFactory {
  /** --- createFromMergedFrontmatter
   * LLMTagFileProcessor などでマージ済みの frontmatter から NoteSummary を生成する。
   * - mergedFrontmatter: frontmatterWriter.update() に渡したオブジェクト
   * - normalizedTags: 正規化済みタグ一覧
   * - newTags: 新規追加されたタグ一覧
   */
  static createFromMergedFrontmatter(
    app: App,
    file: TFile,
    mergedFrontmatter: Record<string, any>,
    normalizedTags: string[],
    newTags: string[]
  ): NoteSummary {
    const path = file.path;
    const summary = mergedFrontmatter.summary ?? '(要約なし)';

    const createdAtStr: string | undefined = mergedFrontmatter.createdAt;
    const createdAt = createdAtStr ? new Date(createdAtStr) : new Date();
    const dailynote: string | undefined = mergedFrontmatter.dailynote;
    const taskKey: string | undefined = mergedFrontmatter.taskKey;

    // 既存実装と互換性を優先し、noteFolder は一旦 "ルート" とする
    const noteFolder = 'ルート';

    const updatedAt = new Date(file.stat.mtime);

    logger.debug(
      `[NoteSummaryFactory.createFromMergedFrontmatter] path=${path} tags=${normalizedTags.length} newTags=${newTags.length}`
    );

    return new NoteSummary(
      path,
      summary,
      normalizedTags,
      newTags,
      createdAt,
      dailynote,
      taskKey,
      noteFolder,
      updatedAt,
      file
    );
  }

  /** --- createMinimal
   * frontmatter を持たない／LLM未実行ノート向けの簡易 NoteSummary 生成。
   * - 今後、スキャンベースの集計やバックフィル用途で利用を想定。
   */
  static createMinimal(
    app: App,
    file: TFile,
    options?: {
      summary?: string;
      tags?: string[];
    }
  ): NoteSummary {
    const path = file.path;
    const summary = options?.summary ?? '(要約なし)';
    const tags = options?.tags ?? [];
    const newTags: string[] = [];

    const createdAt = new Date(file.stat.ctime);
    const updatedAt = new Date(file.stat.mtime);
    const dailynote: string | undefined = undefined;
    const taskKey: string | undefined = undefined;
    const noteFolder = 'ルート';

    logger.debug(
      `[NoteSummaryFactory.createMinimal] path=${path} tags=${tags.length}`
    );

    return new NoteSummary(
      path,
      summary,
      tags,
      newTags,
      createdAt,
      dailynote,
      taskKey,
      noteFolder,
      updatedAt,
      file
    );
  }
}
