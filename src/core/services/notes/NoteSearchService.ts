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
    const targetKey = DateUtil.dateKey(date); // "YYYY-MM-DD"
    const results: TFile[] = [];

    const allFiles = this.app.vault.getMarkdownFiles();

    // --- ① ctime(日付のみ)で事前フィルタリング
    const filtered = allFiles.filter((f) => {
      const ctime = new Date(f.stat.ctime); // OS依存 (UTC の可能性あり)

      // ★ ローカル日付に正規化 → YYYY-MM-DD に変換
      const ctimeKey = DateUtil.dateKey(ctime);

      return ctimeKey === targetKey;
    });

    logger.debug(
      `[NoteSearchService.findByDate] pre-filtered=${filtered.length} files`
    );

    // --- ② YAML frontmatter解析（候補のみ）
    for (const file of filtered) {
      const fm = await NoteFrontmatterParser.parseFromFile(this.app, file);

      const dailynoteKey = fm.dailynote
        ? DateUtil.extractDateKeyFromLink(fm.dailynote)
        : undefined;

      if (dailynoteKey === targetKey) {
        results.push(file);
      }
    }

    logger.debug(
      `[NoteSearchService.findByDate] ${targetKey} -> ${results.length} matched`
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
