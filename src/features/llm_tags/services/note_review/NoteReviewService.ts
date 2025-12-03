// File: src/features/llm_tags/services/note_review/NoteReviewService.ts

import { App, TFile } from 'obsidian';
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { LLMTagFileProcessor } from '../llm/LLMTagFileProcessor';
import { TagAliases } from 'src/core/models/tags/TagAliases';
import { NoteSummary } from 'src/core/models/notes/NoteSummary';
import { FrontmatterWriter } from 'src/core/utils/frontmatter/FrontmatterWriter';
import { DateUtil } from 'src/core/utils/date/DateUtil';
import { DailyNoteConfig } from 'src/core/utils/daily_note/DailyNoteConfig';
import { logger } from 'src/core/services/logger/loggerInstance';
import {
  EditableNoteSummary,
  EditableNoteSummaryFactory,
} from './EditableNoteSummary';

export class NoteReviewService {
  private readonly processor: LLMTagFileProcessor;
  private readonly fmWriter: FrontmatterWriter;

  constructor(private readonly app: App, client: LLMClient) {
    this.processor = new LLMTagFileProcessor(app, client);
    this.fmWriter = new FrontmatterWriter(app.vault);
  }

  async getPreview(
    file: TFile,
    prompt: string,
    aliases: TagAliases
  ): Promise<NoteSummary> {
    return this.processor.preview(file, prompt, aliases);
  }

  createEditable(summary: NoteSummary): EditableNoteSummary {
    return EditableNoteSummaryFactory.fromNoteSummary(summary);
  }

  /**
   * 保存処理（summary, tags, dailynote）
   */
  async saveResult(file: TFile, editable: EditableNoteSummary): Promise<void> {
    logger.info(
      `[NoteReviewService.saveResult] update frontmatter: ${file.path}`
    );

    const enabledTags = editable.tags
      .filter((t) => t.enabled)
      .map((t) => t.name);

    const newData: Record<string, any> = {
      summary: editable.summary,
      tags: enabledTags,
    };

    // --- dailynote 更新処理（Wikiリンク形式で保存）
    if (editable.updateDailyNote) {
      const settings = await DailyNoteConfig.getDailyNoteSettingsFromJson(
        this.app.vault
      );

      const today = DateUtil.formatDate(new Date(), settings.format);
      const folder = settings.folder || '_journal';

      const wikiLink = `[[${folder}/${today}|${today}]]`;
      newData['dailynote'] = wikiLink;

      logger.info(`[NoteReviewService.saveResult] set dailynote=${wikiLink}`);
    }

    await this.fmWriter.update(file, newData);
  }
}
