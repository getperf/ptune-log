import { App, Notice } from 'obsidian';
import { DailyNoteConfig } from 'src/core/utils/daily_note/DailyNoteConfig';
import { TaskSummaryReportBuilder } from '../services/TaskSummaryReportBuilder';
import { logger } from 'src/core/services/logger/loggerInstance';
import { MyTaskFactory } from 'src/core/models/tasks/MyTaskFactory';
import { WinAppUriBuilder } from './WinAppUriBuilder';
import { WinAppLauncher } from './WinAppLauncher';
import { ErrorUtils } from 'src/core/utils/common/ErrorUtils';

/**
 * WinUI アプリからタスクをインポートしてデイリーノートに出力
 */
export class TasksWinImporter {
  private static readonly OUTPUT_FILE = 'import_tasks.json';
  private static readonly TASKLIST_NAME = 'Today';

  constructor(private app: App) { }

  openImportModal(): void {
    logger.debug('[TasksWinImporter.openImportModal] start');
    const builder = new TaskSummaryReportBuilder(this.app);
    void this.handleImport(builder);
  }

  private async handleImport(builder: TaskSummaryReportBuilder): Promise<void> {
    logger.info('[TasksWinImporter.handleImport] start');
    try {
      new Notice('WinUI アプリを起動しています...');
      const uri = WinAppUriBuilder.buildImport(
        this.app,
        TasksWinImporter.OUTPUT_FILE
      );
      const launcher = new WinAppLauncher(this.app.vault);
      const success = await launcher.launchAndWait(uri, 'import');

      if (!success) {
        logger.warn('[TasksWinImporter] launch failed or timed out');
        new Notice('インポート失敗（ステータス未完了）');
        return;
      }

      const jsonPath = `/.obsidian/plugins/ptune-log/work/${TasksWinImporter.OUTPUT_FILE}`;
      const jsonText = await this.app.vault.adapter.read(jsonPath);
      const rawTasks = JSON.parse(jsonText);
      const myTasks = rawTasks.map((t: any) =>
        MyTaskFactory.fromApiData(
          t,
          t.tasklist_id ?? TasksWinImporter.TASKLIST_NAME
        )
      );
      myTasks.reverse();
      await builder.buildFromMyTasks(myTasks);

      const notePath = await DailyNoteConfig.getNotePathForDate(
        this.app.vault,
        new Date()
      );
      logger.info(`[TasksWinImporter] updated daily note: ${notePath}`);
    } catch (err) {
      const msg = ErrorUtils.toMessage(err);
      logger.error('[TasksWinImporter] import error', err);
      new Notice(`❌ インポート処理でエラーが発生しました: ${msg}`);
    }
  }
}
