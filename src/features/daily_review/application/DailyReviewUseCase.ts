// File: src/features/daily_review/application/DailyReviewUseCase.ts
import { App, Notice, TFile, TFolder } from 'obsidian';
import { DailyNoteUpdater } from 'src/features/daily_review/services/DailyNoteUpdater';
import { DailyReviewModal } from '../ui/DailyReviewModal';
import { NoteAnalysisRunner } from '../../../core/services/llm/note_analysis/NoteAnalysisRunner';
import { NoteAnalysisService } from '../../note_analysis/analysis/NoteAnalysisService';
import { ReviewSettings } from 'src/config/settings/ReviewSettings';
import { DailyNoteLoaderOld } from 'src/core/services/daily_notes/file_io/DailyNoteLoaderOld';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';
import { NoteAnalysisPromptService } from 'src/core/services/llm/note_analysis/NoteAnalysisPromptService';

export class DailyReviewUseCase {
  private readonly analysis: NoteAnalysisService;

  constructor(
    private readonly app: App,
    private readonly client: LLMClient,
    private readonly runner: NoteAnalysisRunner,
    private readonly reviewSettings: ReviewSettings
  ) {
    this.analysis = new NoteAnalysisService(app, client);
  }

  async runOnFile(file: TFile): Promise<void> {
    if (!this.client.hasValidApiKey()) {
      new Notice('⚠️ APIキー未設定');
      return;
    }

    const prompt = await NoteAnalysisPromptService.build(this.app);
    await this.runner.runOnFiles([file], prompt);
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

    const prompt = await NoteAnalysisPromptService.build(this.app);

    const modal = new DailyReviewModal(this.app, {
      mode: 'folder',
      initialFiles: files,
      onConfirm: async (modal, files) => {
        void this.runner
          .runOnFiles(files, prompt, modal)
          .then(() => modal.close());
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
    const initialDate = new Date();
    const initialFiles = await this.runner.findFilesByDate(initialDate);
    const prompt = await NoteAnalysisPromptService.build(this.app);

    const modal = new DailyReviewModal(this.app, {
      mode: 'date',
      initialDate,
      initialFiles,
      onDateChange: (date) => this.runner.findFilesByDate(date),
      onConfirm: async (modal, files, selectedDate, forceRegenerate) => {
        void this.runner
          .runOnFiles(files, prompt, modal, forceRegenerate)
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
          .then((analyzed) =>
            new DailyNoteUpdater(this.app).update(
              analyzed,
              selectedDate,
              { enableChecklist }
            )
          )
          .then(() => {
            modal.showCompletionMessage('今日の振り返りが完了しました');
            setTimeout(() => modal.close(), 1500);
          });
      },
    });

    modal.open();
  }
}
