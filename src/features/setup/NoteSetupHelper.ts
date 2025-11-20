import { App, Notice } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';
import { DAILY_NOTE_TEMPLATE } from 'src/core/templates/daily_note_template';

export class NoteSetupHelper {
  constructor(private app: App) { }

  /** 初期化済フラグファイル */
  private readonly initFlagPath = '_tagging/config/.init_done';

  /** ディレクトリ構造定義 */
  private readonly targetDirs: Record<string, string[]> = {
    _project: [],
    _journal: ['meta'],
    _templates: ['note'],
    _tagging: ['config', 'tags', 'meta', 'aliases'],
  };

  /** 指定ディレクトリの作成 */
  private async createNestedFolders(
    baseDirs: Record<string, string[]>
  ): Promise<string[]> {
    const { vault } = this.app;
    const created: string[] = [];

    logger.debug('[NoteSetupHelper] createNestedFolders start');

    for (const [base, subs] of Object.entries(baseDirs)) {
      try {
        if (!(await vault.adapter.exists(base))) {
          await vault.createFolder(base);
          created.push(base);
          logger.debug(`[NoteSetupHelper] created base: ${base}`);
        }

        for (const sub of subs) {
          const full = `${base}/${sub}`;
          if (!(await vault.adapter.exists(full))) {
            await vault.createFolder(full);
            created.push(full);
            logger.debug(`[NoteSetupHelper] created sub: ${full}`);
          }
        }
      } catch (err) {
        logger.error(`[NoteSetupHelper] failed to create: ${base}`, err);
      }
    }

    logger.debug(
      `[NoteSetupHelper] createNestedFolders complete (count=${created.length})`
    );
    return created;
  }

  /** テンプレート作成 */
  private async ensureTemplateFile(path: string, content: string): Promise<void> {
    const { vault } = this.app;
    try {
      if (!(await vault.adapter.exists(path))) {
        await vault.create(path, content);
        logger.debug(`[NoteSetupHelper] created template: ${path}`);
      }
    } catch (err) {
      logger.error(`[NoteSetupHelper] failed to create template: ${path}`, err);
    }
  }

  /** 初期セットアップ */
  async ensureResources(): Promise<void> {
    const adapter = this.app.vault.adapter;

    // --- すでに初期化済ならスキップ ---
    if (await adapter.exists(this.initFlagPath)) {
      logger.debug('[NoteSetupHelper] already initialized, skip');
      return;
    }

    logger.info('[NoteSetupHelper] ensureResources start');

    const created = await this.createNestedFolders(this.targetDirs);

    await this.ensureTemplateFile(
      '_templates/note/daily_note.md',
      DAILY_NOTE_TEMPLATE
    );

    // --- 初期化済フラグ作成 ---
    await adapter.write(this.initFlagPath, 'initialized=true');

    if (created.length > 0) {
      new Notice('ノート構造を初期化しました。', 5000);
    }

    logger.info('[NoteSetupHelper] ensureResources complete');
  }
}
