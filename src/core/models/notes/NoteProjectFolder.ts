import { logger } from 'src/core/services/logger/loggerInstance';
import { NoteSummary } from './NoteSummary';
import { App, TFile, TFolder } from 'obsidian';
import { FolderIndexParser } from 'src/core/utils/frontmatter/FolderIndexParser';

/**
 * --- NoteProjectFolder
 * フォルダ（プロジェクト）単位で NoteSummary を管理するモデル。
 */
export class NoteProjectFolder {
  constructor(public readonly noteFolder: string) {}

  private commonTags: string[] = [];
  private readonly notes: NoteSummary[] = [];

  /** index.md 読み込み済みフラグ（遅延ロード対応） */
  private loaded = false;

  /** --- ノートを追加 */
  add(note: NoteSummary): void {
    this.notes.push(note);
    logger.debug(
      `[NoteProjectFolder.add] added note=${note.notePath} folder=${this.noteFolder}`
    );
  }

  /** --- 共通タグのセット */
  setCommonTags(tags: string[]): void {
    this.commonTags = [...tags];
    logger.debug(
      `[NoteProjectFolder.setCommonTags] folder=${
        this.noteFolder
      } tags=[${tags.join(', ')}]`
    );
  }

  /** --- 遅延ロードの実施（index.md の読み込み） */
  private async ensureLoaded(app: App): Promise<void> {
    if (this.loaded) return;

    logger.debug(
      `[NoteProjectFolder.ensureLoaded] loading index.md for folder=${this.noteFolder}`
    );

    await this.loadIndexFile(app);

    this.loaded = true;

    logger.debug(
      `[NoteProjectFolder.ensureLoaded] completed folder=${this.noteFolder}`
    );
  }

  /** --- index.md を読み込んで commonTags に反映（存在しない場合は空配列） */
  private async loadIndexFile(app: App): Promise<void> {
    const indexPath = `${this.noteFolder}/index.md`;
    const file = app.vault.getAbstractFileByPath(indexPath);

    if (!file || !(file instanceof TFile)) {
      logger.debug(
        `[NoteProjectFolder.loadIndexFile] index.md not found folder=${this.noteFolder} -> commonTags=[]`
      );
      this.commonTags = [];
      return;
    }

    try {
      const text = await app.vault.read(file);
      const meta = FolderIndexParser.parse(text);

      const tags = meta.commonTags ?? [];
      this.setCommonTags(tags);

      logger.debug(
        `[NoteProjectFolder.loadIndexFile] loaded commonTags=[${tags.join(
          ', '
        )}] folder=${this.noteFolder}`
      );
    } catch (e) {
      logger.warn(
        `[NoteProjectFolder.loadIndexFile] failed to load index.md folder=${this.noteFolder}`,
        e
      );
      this.commonTags = [];
    }
  }

  /** --- 共通タグの取得（初回は index.md を ensure load） */
  async getCommonTags(app: App): Promise<string[]> {
    await this.ensureLoaded(app);
    return [...this.commonTags];
  }

  /** --- フォルダ内ノートの取得 */
  getNotes(): NoteSummary[] {
    return [...this.notes];
  }

  /** --- タグ集計を返す */
  getTagStats(): { tag: string; count: number }[] {
    const counter = new Map<string, number>();
    for (const note of this.notes) {
      for (const tag of note.tags) {
        counter.set(tag, (counter.get(tag) ?? 0) + 1);
      }
    }
    return [...counter.entries()].map(([tag, count]) => ({ tag, count }));
  }

  /** --- 数値プレフィックスでのソート用キー取得（例: 207_学習 → 207） */
  getNumericKey(): number {
    const m = this.noteFolder.match(/^(\d+)_?/);
    return m ? parseInt(m[1], 10) : 0;
  }

  /** --- ObsidianのTFolderとして取得（失敗時はnull） */
  getTFolder(app: App): TFolder | null {
    const abstract = app.vault.getAbstractFileByPath(this.noteFolder);
    if (abstract instanceof TFolder) return abstract;
    return null;
  }
}
