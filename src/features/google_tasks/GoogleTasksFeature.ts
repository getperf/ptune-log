// File: src/features/google_tasks/GoogleTasksFeature.ts
import { Plugin, Notice, App, TFile } from 'obsidian';
import type { GoogleAuthSettings } from '../../config/ConfigManager';
import { GoogleTasksAPI } from './utils/GoogleTasksAPI';
import { GoogleTasksCommandUtil } from 'src/features/google_tasks/utils/GoogleTasksCommandUtil';
import { TasksWinImporter } from './win/TasksWinImporter';
import { TaskSummaryReportBuilder } from './services/TaskSummaryReportBuilder';
import { logger } from 'src/core/services/logger/loggerInstance';
import { MyTaskFactory } from 'src/core/models/tasks/MyTaskFactory';
import { NoteFinder } from 'src/core/utils/note/NoteFinder';
import { DailyNoteConfig } from 'src/core/utils/daily_note/DailyNoteConfig';
import { TasksExport } from './services/TasksExport';
import { TasksWinReauth } from './win/TasksWinReauth';
import { GoogleAuth } from './google_auth/GoogleAuth';
import { GoogleTasksExportModal } from './win/GoogleTasksExportModal';
import { MarkdownTaskParser } from './services/MarkdownTaskParser';
import { ExportTasks } from 'src/core/models/tasks/ExportTasks';
import { DateUtil } from 'src/core/utils/date/DateUtil';
import { FileUtils } from 'src/core/utils/common/FileUtils';

/**
 * Google Tasks 同期コマンド登録クラス
 */
export class GoogleTasksFeature {
  private plugin: Plugin;
  private app: App;
  private settings: GoogleAuthSettings;

  constructor(plugin: Plugin, settings: GoogleAuthSettings) {
    this.plugin = plugin;
    this.app = plugin.app;
    this.settings = settings;
  }

  /**
   * デイリーノートからタスクをエクスポート
   */
  async exportTasksFromDailynote(api: GoogleTasksAPI) {
    logger.info('[GoogleTasksSync.exportTasksFromDailynote] start');
    const path = await DailyNoteConfig.getDailyNotePath(this.app.vault);
    if (!path) {
      new Notice('今日のデイリーノートが見つかりません');
      logger.warn(
        '[GoogleTasksSync.exportTasksFromDailynote] no daily note found'
      );
      return;
    }
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!file || !(file instanceof TFile)) {
      new Notice('Today ノートが存在しないかファイル形式ではありません');
      logger.warn(
        '[GoogleTasksSync.exportTasksFromDailynote] invalid note file'
      );
      return;
    }

    const exporter = new TasksExport(this.app, file, api);
    await exporter.confirmAndRun();
    logger.debug('[GoogleTasksSync.exportTasksFromDailynote] done');
  }

  /**
   * コマンド登録
   */
  regist(): void {
    // --- Google OAuth 再認証 ---
    this.plugin.addCommand({
      id: 'gtasks-reset-auth',
      name: 'Google Tasks: Google認証をやり直す',
      callback: async () => {
        logger.info('[GoogleTasksSync] reauth command called');
        if (this.settings.useWinApp) {
          const reauth = new TasksWinReauth(this.plugin.app);
          await reauth.execute();
        } else {
          const auth = new GoogleAuth(this.plugin, this.settings);
          const success = await auth.reauthorize();
          new Notice(success ? '認証成功しました' : '認証に失敗しました');
          logger.info(`[GoogleTasksSync] reauth result=${success}`);
        }
      },
    });

    // --- デイリーノート → Google Tasks エクスポート ---
    this.plugin.addCommand({
      id: 'gtasks-export-from-daily',
      name: 'Google Tasks: デイリーノートからタスクエクスポート',
      callback: async () => {
        logger.info('[GoogleTasksSync] export-from-daily command called');
        const prepared = await this.savePreExportJsonOrNone();
        if (!prepared) return;

        if (this.settings.useWinApp) {
          new GoogleTasksExportModal(this.app).open();
          logger.debug('[GoogleTasksSync] WinApp export modal opened');
        } else {
          await GoogleTasksCommandUtil.wrap(
            this.plugin,
            this.settings,
            async (api) => {
              await this.exportTasksFromDailynote(api);
            }
          )();
        }
      },
    });

    // --- Google Tasks → デイリーノート レポート出力 ---
    this.plugin.addCommand({
      id: 'gtasks-import-to-note',
      name: 'Google Tasks: タスクの振り返りレポート',
      callback: async () => {
        logger.info('[GoogleTasks] import-to-note command called');
        if (this.settings.useWinApp) {
          new TasksWinImporter(this.app).openImportModal();
          return;
        }

        await GoogleTasksCommandUtil.wrap(
          this.plugin,
          this.settings,
          async (api: GoogleTasksAPI) => {
            const taskListId = await api.findTaskListId('Today');
            if (!taskListId) {
              new Notice("タスクリスト 'Today' が見つかりません");
              return;
            }

            const rawTasks = await api.listTasks(taskListId);
            const myTasks = rawTasks.map((t) =>
              MyTaskFactory.fromApiData(t, taskListId)
            );

            const builder = new TaskSummaryReportBuilder(this.app);
            await builder.buildFromMyTasks(myTasks);
          }
        )();
      },
    });

    // --- Debug: 今日のノート記録を出力 ---
    this.plugin.addCommand({
      id: 'debug-find-notes-today',
      name: 'Debug: 今日のノート記録を出力',
      callback: async () => {
        const finder = new NoteFinder(this.app);
        const today = new Date();
        const notes = await finder.findNotesByDate(today);

        if (notes.length === 0) {
          new Notice('⚠️ 今日の日付のノートが見つかりません');
          logger.info('[DebugFindNotes] No notes found for today');
          return;
        }

        logger.info(
          `[DebugFindNotes] ${notes.length} notes for ${DateUtil.localDate(
            today
          )}`
        );
        for (const note of notes) {
          logger.debug(
            `[DebugFindNotes] ${note.notePath} → dailynote=${note.dailynote
            }, updated=${note.updatedAt ? DateUtil.utcString(note.updatedAt) : 'none'
            }`
          );
        }
        new Notice(`✅ ${notes.length} 件のノート情報をログに出力しました`);
      },
    });
  }

  private async savePreExportJsonOrNone(): Promise<boolean> {
    const path = await DailyNoteConfig.getDailyNotePath(this.app.vault);
    if (!path) {
      new Notice('今日のデイリーノートが見つかりません');
      logger.warn('[GoogleTasksFeature] no daily note');
      return false;
    }
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!file || !(file instanceof TFile)) {
      new Notice('Today ノートが存在しないかファイル形式ではありません');
      logger.warn('[GoogleTasksFeature] invalid daily note file');
      return false;
    }

    const lines = await FileUtils.readSection(
      this.app,
      file,
      '今日の予定タスク'
    );
    const parsed = MarkdownTaskParser.parse(lines);
    const exportTasks = ExportTasks.fromParsedTasks(parsed);
    await exportTasks.save(this.app);

    logger.info(
      `[GoogleTasksFeature] saved pre-export JSON: ${exportTasks.getJsonPath()}`
    );
    return true;
  }
}
