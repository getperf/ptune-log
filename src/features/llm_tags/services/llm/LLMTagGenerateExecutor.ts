// File: src/features/llm_tags/services/llm/LLMTagGenerateExecutor.ts
import { App, Notice, TFile, TFolder } from 'obsidian';
import { DailyNoteUpdater } from 'src/features/daily_notes/DailyNoteUpdater';
import { LLMTagGeneratorModal } from './LLMTagGeneratorModal';
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { LLMTagGenerationRunner } from './LLMTagGenerationRunner';
import { NoteAnalysisService } from '../analysis/NoteAnalysisService';
import { ReviewSettings } from 'src/config/settings/ReviewSettings';
import { DailyNoteReader } from 'src/core/services/daily_notes/file_io/DailyNoteReader';
import { DailyNoteLoaderOld } from 'src/core/services/daily_notes/file_io/DailyNoteLoaderOld';
import { DailyNoteOld } from 'src/core/models/daily_notes/DailyNoteOld';

export class LLMTagGenerateExecutor {
  private readonly analysis: NoteAnalysisService;

  constructor(
    private readonly app: App,
    private readonly client: LLMClient,
    private readonly runner: LLMTagGenerationRunner,
    private readonly reviewSettings: ReviewSettings
  ) {
    this.analysis = new NoteAnalysisService(app, client);
  }

  async runOnFile(file: TFile): Promise<void> {
    if (!this.client.hasValidApiKey()) {
      new Notice('⚠️ APIキー未設定');
      return;
    }
    await this.runner.runOnFiles([file]);
  }

  async runOnFolder(folder: TFolder): Promise<void> {
    if (!this.client.hasValidApiKey()) {
      new Notice('⚠️ APIキー未設定');
      return;
    }

    const files = this.runner.findFilesInFolder(folder);
    if (!files.length) {
      new Notice('Markdownファイルが見つかりません');
      return;
    }

    const modal = new LLMTagGeneratorModal(this.app, {
      mode: 'folder',
      initialFiles: files,
      onConfirm: async (modal, files) => {
        void this.runner.runOnFiles(files, modal).then(() => {
          modal.close();
        });
      },
    });

    modal.open();
  }

  /** --- 日付指定（振り返り） */
  async runOnDate(): Promise<void> {
    if (!this.client.hasValidApiKey()) {
      new Notice('⚠️ APIキー未設定');
      return;
    }
    const enableChecklist = this.client.settings.enableChecklist ?? true;
    const enableCommonTag = this.reviewSettings.enableCommonTag ?? true;

    const modal = new LLMTagGeneratorModal(this.app, {
      mode: 'date',
      initialDate: new Date(),
      onConfirm: (modal, files, selectedDate, forceRegenerate) => {
        void this.runner
          .runOnFiles(files, modal, forceRegenerate)
          .then(async (summaries) => {
            const dailyNote = await DailyNoteLoaderOld.load(
              this.app,
              selectedDate
            );

            return this.analysis.analyze(summaries, dailyNote, {
              enableCommonTag: this.reviewSettings.enableCommonTag ?? true,
              forceCommonTags: forceRegenerate,
            });
          })
          .then((analyzed) => {
            return new DailyNoteUpdater(this.app).update(
              analyzed,
              selectedDate,
              { enableChecklist }
            );
          })
          .then(() => {
            modal.showCompletionMessage('今日の振り返りが完了しました');
            setTimeout(() => modal.close(), 1500);
          });
      },
    });

    modal.open();
  }
}
