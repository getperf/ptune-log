import { TFile } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';

/**
 * --- NoteSummary
 * 単一ノートの解析結果を保持するモデル。
 * createdAt, dailynote, taskKey, goal などメタ情報を統一管理。
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
    public readonly file?: TFile,
    public readonly goal?: string
  ) {}

  /** --- fromFileData
   * TFileとfrontmatterデータから NoteSummary を生成。
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
      goal?: string;
    }
  ): NoteSummary {
    const summary = data.summary ?? '(要約なし)';
    const tags = data.tags ?? [];
    const newTagCandidates = data.newCandidates ?? [];
    const updatedAt = new Date(file.stat.mtime);

    logger.debug(
      `[NoteSummary.fromFileData] created ${file.path}, tags=${
        tags.length
      }, goal=${data.goal ?? 'none'}`
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
      file,
      data.goal ?? undefined
    );
  }

  /** --- Markdown 要約を生成 */
  toMarkdownSummary(): string {
    const base = this.notePath.replace(/\.md$/, '').split('/').pop();
    const link = `[[${this.notePath.replace(/\.md$/, '')}|${base}]]`;

    const summaryLine = `- 要約: ${this.summary}`;
    const goalLine = this.goal ? `- 目標: ${this.goal}` : '';

    return [`- ${link}`, summaryLine, goalLine].filter(Boolean).join('\n');
  }
}
