import { TFile } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';

/**
 * --- NoteSummary
 * 単一ノートの解析結果を保持するモデル。
 * createdAt, dailynote, taskKey などメタ情報を統一管理。
 */
export class NoteSummary {
  constructor(
    public readonly notePath: string,
    public readonly summary: string,
    public readonly tags: string[],
    public readonly newTagCandidates: string[],
    public readonly createdAt: Date,
    public readonly dailynote?: string, // リンク形式
    public readonly taskKey?: string,
    public noteFolder: string = 'ルート',
    public readonly updatedAt?: Date,
    public readonly file?: TFile
  ) { }

  /** --- fromFileData
   * TFileと解析データから NoteSummary を生成。
   */
  static fromFileData(
    file: TFile,
    data: {
      summary?: string;
      tags?: string[];
      newCandidates?: string[];
      createdAt?: Date;
      dailynote?: string;
      taskKey?: string;
    }
  ): NoteSummary {
    const summary = data.summary ?? '(要約なし)';
    const tags = data.tags ?? [];
    const newTagCandidates = data.newCandidates ?? [];
    const updatedAt = new Date(file.stat.mtime);

    logger.debug(
      `[NoteSummary.fromFileData] created ${file.path}, tags=${tags.length}, dailynote=${data.dailynote ?? 'none'}, created=${data.createdAt}`
    );

    return new NoteSummary(
      file.path,
      summary,
      tags,
      newTagCandidates,
      data.createdAt ?? new Date(),
      data.dailynote,
      data.taskKey,
      'ルート',
      updatedAt,
      file
    );
  }

  /** --- Markdown 要約を生成 */
  toMarkdownSummary(): string {
    const base = this.notePath.replace(/\.md$/, '').split('/').pop();
    return `- [[${this.notePath.replace(/\.md$/, '')}|${base}]]\n  - 要約: ${this.summary}`;
  }
}
