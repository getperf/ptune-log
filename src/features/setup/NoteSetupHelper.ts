import { App, Notice } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';
import { DAILY_NOTE_TEMPLATE } from 'src/core/templates/daily_note_template';

export class NoteSetupHelper {
  constructor(private app: App) {}

  /** ディレクトリ構造定義 */
  private readonly targetDirs: Record<string, string[]> = {
    _project: [],
    _journal: ['meta'],
    _templates: ['note'],
    _tagging: ['config', 'tags', 'meta', 'aliases'],
  };

  /** 指定されたネスト構造のディレクトリを作成 */
  private async createNestedFolders(
    baseDirs: Record<string, string[]>
  ): Promise<string[]> {
    const { vault } = this.app;
    const created: string[] = [];

    logger.debug('[NoteSetupHelper] createNestedFolders start');

    for (const [base, subDirs] of Object.entries(baseDirs)) {
      try {
        if (!(await vault.adapter.exists(base))) {
          await vault.createFolder(base);
          created.push(base);
          logger.debug(`[NoteSetupHelper] created base folder: ${base}`);
        } else {
          logger.debug(`[NoteSetupHelper] base exists: ${base}`);
        }

        for (const sub of subDirs) {
          const fullPath = `${base}/${sub}`;
          if (!(await vault.adapter.exists(fullPath))) {
            await vault.createFolder(fullPath);
            created.push(fullPath);
            logger.debug(`[NoteSetupHelper] created sub folder: ${fullPath}`);
          } else {
            logger.debug(`[NoteSetupHelper] sub exists: ${fullPath}`);
          }
        }
      } catch (err) {
        logger.error(`[NoteSetupHelper] failed to create folder: ${base}`, err);
      }
    }

    logger.debug(
      `[NoteSetupHelper] createNestedFolders complete count=${created.length}`
    );
    return created;
  }

  /** テンプレートファイルが存在しない場合は作成 */
  private async ensureTemplateFile(
    path: string,
    content: string
  ): Promise<void> {
    const { vault } = this.app;
    try {
      if (!(await vault.adapter.exists(path))) {
        await vault.create(path, content);
        logger.debug(`[NoteSetupHelper] created template file: ${path}`);
      } else {
        logger.debug(`[NoteSetupHelper] template exists: ${path}`);
      }
    } catch (err) {
      logger.error(`[NoteSetupHelper] failed to create template: ${path}`, err);
    }
  }

  /** ノート関連リソースの初期化 */
  async ensureResources(): Promise<void> {
    logger.info('[NoteSetupHelper] ensureResources start');

    const created = await this.createNestedFolders(this.targetDirs);
    await this.ensureTemplateFile(
      '_templates/note/daily_note.md',
      DAILY_NOTE_TEMPLATE
    );

    if (created.length > 0) {
      logger.info(
        `[NoteSetupHelper] initialized ${created.length} directories`
      );
      new Notice('テンプレートディレクトリを初期化しました。');
    } else {
      logger.debug('[NoteSetupHelper] no directories created');
    }

    logger.info('[NoteSetupHelper] ensureResources complete');
  }
}
