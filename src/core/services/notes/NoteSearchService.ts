// File: src/core/services/notes/NoteSearchService.ts
import { App, TFile, TFolder } from 'obsidian';
import { NoteFrontmatterParser } from 'src/core/utils/frontmatter/NoteFrontmatterParser';
import { logger } from 'src/core/services/logger/loggerInstance';
import { DateUtil } from 'src/core/utils/date/DateUtil';

/**
 * ノート検索サービス
 * - createdAt / dailynote ベースの日付検索
 * - フォルダ単位検索
 * ※旧 dailynoteDate は廃止
 */
export class NoteSearchService {
  constructor(private readonly app: App) {}

  /**
   * 指定日付(createdAt または dailynote)のノートを検索
   * 1. システム作成日(ctime)で事前フィルタ
   * 2. YAML frontmatterで確定判定
   */
  async findByDate(date: Date): Promise<TFile[]> {
    const dateKey = DateUtil.dateKey(date);
    const results: TFile[] = [];

    // --- ① 先にシステム日付フィルタリング
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const allFiles = this.app.vault.getMarkdownFiles();
    const filtered = allFiles.filter((f) => {
      const ctime = new Date(f.stat.ctime);
      return ctime >= start && ctime <= end;
    });

    logger.debug(
      `[NoteSearchService.findByDate] pre-filtered=${filtered.length} files`
    );

    // --- ② YAML frontmatter解析（対象候補のみ）
    for (const file of filtered) {
      const fm = await NoteFrontmatterParser.parseFromFile(this.app, file);
      const dailynoteKey = fm.dailynote
        ? DateUtil.extractDateKeyFromLink(fm.dailynote)
        : undefined;

      if (dailynoteKey === dateKey) {
        results.push(file);
      }
    }

    logger.debug(
      `[NoteSearchService.findByDate] ${dateKey} -> ${results.length} matched`
    );
    return results;
  }

  /**
   * 指定フォルダ配下のMarkdownファイルを再帰的に取得
   */
  findInFolder(folder: TFolder): TFile[] {
    const results: TFile[] = [];
    const traverse = (f: TFolder) => {
      for (const child of f.children) {
        if (child instanceof TFile && child.extension === 'md')
          results.push(child);
        else if (child instanceof TFolder) traverse(child);
      }
    };
    traverse(folder);
    logger.debug(
      `[NoteSearchService.findInFolder] folder=${folder.path} -> ${results.length} files`
    );
    return results;
  }
}
