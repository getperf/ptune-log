// File: src/features/google_tasks/services/TaskSummaryReportModal.ts
import { App, Modal, Setting } from 'obsidian';
import moment from 'moment';
import { TaskSummaryReportOptions } from './TaskSummaryReportBuilder';
import { DateUtil } from 'src/core/utils/date/DateUtil';

export class TaskSummaryReportModal extends Modal {
  private includeBacklog = true;
  private targetDate: Date = moment().toDate();
  private dateOptions: Date[] = [];

  private onSubmit: (opts: TaskSummaryReportOptions) => void;

  constructor(app: App, onSubmit: (opts: TaskSummaryReportOptions) => void) {
    super(app);
    this.onSubmit = onSubmit;

    // 過去7日分の日付リストを生成
    this.dateOptions = [];
    for (let i = 0; i < 7; i++) {
      const date = moment().subtract(i, 'days').toDate();
      this.dateOptions.push(date);
    }
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: '📝 タスクサマリ出力設定' });

    // 🔽 日付選択（プルダウン）
    new Setting(contentEl)
      .setName('デイリーノート保存先の日付')
      .setDesc('追記するデイリーノートの日付を選択してください。')
      .addDropdown((dropdown) => {
        this.dateOptions.forEach((date) => {
          const label = DateUtil.localDate(date);
          dropdown.addOption(DateUtil.localDate(date), label);
        });
        dropdown.setValue(DateUtil.localDate(this.targetDate));

        dropdown.onChange((val) => {
          this.targetDate = new Date(val);
        });
      });

    // ✅ バックログ有無のチェックボックス
    new Setting(contentEl)
      .setName('バックログを含める')
      .setDesc('未完了タスク（バックログ）の抽出をレポートに含めるか')
      .addToggle((toggle) => {
        toggle.setValue(this.includeBacklog);
        toggle.onChange((val) => {
          this.includeBacklog = val;
        });
      });

    // 📝 実行・キャンセルボタン
    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText('📝 デイリーノートに追記')
          .setCta()
          .onClick(() => {
            this.onSubmit({
              includeBacklog: this.includeBacklog,
              targetDate: this.targetDate,
            });
            setTimeout(() => this.close(), 1500);
          })
      )
      .addButton((btn) =>
        btn.setButtonText('キャンセル').onClick(() => this.close())
      );
  }

  onClose() {
    this.contentEl.empty();
  }
}
