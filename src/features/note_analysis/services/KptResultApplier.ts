// File: src/features/daily_review/services/kpt/KptResultApplier.ts

import { App, parseYaml } from 'obsidian';
import { DailyNoteWriter } from 'src/core/services/daily_notes/file_io/DailyNoteWriter';
import { KPTResult } from 'src/core/models/daily_notes/KPTResult';
import { YamlCodeBlockExtractor } from 'src/core/utils/markdown/YamlCodeBlockExtractor';
import { DailyNote } from 'src/core/models/daily_notes/DailyNote';
import { DateUtil } from 'src/core/utils/date/DateUtil';
import { logger } from 'src/core/services/logger/loggerInstance';
import { ReviewSettings } from 'src/config/settings/ReviewSettings';
import { KptOutputFormatterFactory } from './formatters/KptOutputFormatterFactory';

/**
 * unknown → string[] 正規化
 */
function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

/**
 * KPTResult 正規化
 */
export function normalizeKptResult(raw: Partial<KPTResult>): KPTResult {
  return {
    Keep: normalizeStringList(raw.Keep),
    Problem: normalizeStringList(raw.Problem),
    Try: normalizeStringList(raw.Try),
  };
}

export class KptResultApplier {
  private readonly writer: DailyNoteWriter;

  constructor(
    private readonly app: App,
    private readonly reviewSettings: ReviewSettings
  ) {
    this.writer = new DailyNoteWriter(app);
  }

  /**
   * LLM 出力を KPT として DailyNote に反映
   */
  async apply(dailyNote: DailyNote, llmMarkdown: string): Promise<void> {
    logger.debug('[KptResultApplier] apply start');

    try {
      // 1. YAML 抽出
      const yamlText = YamlCodeBlockExtractor.extract(llmMarkdown);
      if (!yamlText) {
        throw new Error('KPT YAML block not found in LLM output.');
      }

      // 2. YAML → Object
      let parsed: Partial<KPTResult>;
      try {
        parsed = parseYaml(yamlText) as Partial<KPTResult>;
      } catch (e) {
        logger.error('[KptResultApplier] YAML parse failed', e);
        throw new Error('Failed to parse KPT YAML.');
      }

      // 3. 正規化
      const result = normalizeKptResult(parsed);

      // 4. 出力フォーマット選択（唯一の分岐点）
      const formatter = KptOutputFormatterFactory.create(
        this.reviewSettings.kptOutputMode
      );
      const content = formatter.format(result);

      // 5. DailyNote へ append
      const suffix = `(${DateUtil.localTime()})`;
      const updated = dailyNote.appendKpt(content, suffix, 'first');

      // 6. 保存
      await this.writer.writeToActive(updated);

      logger.info('[KptResultApplier] apply completed');
    } catch (e) {
      logger.error('[KptResultApplier] apply failed', e);
      throw e;
    }
  }
}
