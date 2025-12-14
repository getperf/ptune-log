// File: src/core/utils/common/FileUtils.ts
import { App, TFile } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';

export class FileUtils {
  /** 1ファイル全行読み込み */
  static async readLines(app: App, file: TFile): Promise<string[]> {
    const content = await app.vault.read(file);
    return content.split(/\r?\n/);
  }

  /** 行配列からセクション抽出 */
  static extractSection(lines: string[], keyword: string): string[] {
    const isHeading = (l: string) => l.trim().startsWith('#');
    const isRule = (l: string) => /^\s{0,3}(-{3,}|_{3,}|\*{3,})\s*$/.test(l);

    let start = -1;
    for (let i = 0; i < lines.length; i++) {
      if (isHeading(lines[i]) && lines[i].includes(keyword)) {
        start = i + 1;
        break;
      }
    }
    if (start < 0) return [];

    let end = lines.length;
    for (let i = start; i < lines.length; i++) {
      if (isHeading(lines[i]) || isRule(lines[i])) {
        end = i;
        break;
      }
    }
    return lines.slice(start, end);
  }

  /** ファイルから指定セクション抽出 */
  static async readSection(
    app: App,
    file: TFile,
    keyword: string
  ): Promise<string[]> {
    const lines = await FileUtils.readLines(app, file);
    return FileUtils.extractSection(lines, keyword);
  }

  /**
   * 見出し配下の「最初のタスク行（- [ ] ...）」から次の ## 見出し直前までを洗い替え。
   * - 見出し直下の前置き（# 今日の予定タスク / コメント等）は保持
   * - '---' や '# Exported at ...' は削除対象（洗い替え領域に含める）
   */
  static replaceTaskListInSection(
    markdown: string,
    heading: string,
    taskMarkdown: string
  ): string {
    const lines = markdown.split('\n');
    const out: string[] = [];

    const isSectionHeading = (l: string) => /^##\s+/.test(l);
    const isTaskLine = (l: string) => /^\s*-\s*\[[ xX]\]\s+/.test(l);

    let inSection = false;
    let inReplace = false;
    let replaced = false;

    logger.debug(
      `[FileUtils.replaceTaskListInSection] start heading="${heading}" lines=${lines.length} taskLen=${taskMarkdown.length}`
    );

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // セクション開始
      if (!inSection && line.trim() === heading.trim()) {
        logger.info(
          `[FileUtils.replaceTaskListInSection] heading matched at line=${i}`
        );
        inSection = true;
        out.push(line); // 見出しは保持
        continue;
      }

      if (inSection) {
        // 次の ## 見出しでセクション終了
        if (isSectionHeading(line)) {
          if (!replaced) {
            // タスク行が1行も見つからずに次セクションに来た場合：末尾に挿入
            logger.warn(
              '[FileUtils.replaceTaskListInSection] no task line found; insert at end of section'
            );
            out.push('', taskMarkdown.trim(), '');
            replaced = true;
          }
          inSection = false;
          inReplace = false;
          out.push(line);
          continue;
        }

        // 置換開始：最初のタスク行を見つけたら、その直前までの前置きは保持して
        // タスク領域を丸ごと差し替える
        if (!inReplace && isTaskLine(line)) {
          logger.info(
            `[FileUtils.replaceTaskListInSection] first task line at line=${i} -> start replacing`
          );
          out.push('', taskMarkdown.trim(), '');
          inReplace = true;
          replaced = true;
          continue; // 以降の旧タスクは破棄
        }

        // 置換中：次の ## まで旧行を捨てる
        if (inReplace) {
          continue;
        }

        // 置換前の前置き（# 見出し / コメント / 空行 など）は保持
        out.push(line);
        continue;
      }

      // セクション外はそのまま
      out.push(line);
    }

    // ファイル末尾まで来てしまった場合（最後のセクションだった等）
    if (inSection && !replaced) {
      logger.warn(
        '[FileUtils.replaceTaskListInSection] reached EOF in section; insert tasks'
      );
      out.push('', taskMarkdown.trim(), '');
    }

    const output = out.join('\n').replace(/\n{3,}/g, '\n\n');
    logger.debug(
      `[FileUtils.replaceTaskListInSection] output length=${output.length}`
    );
    return output;
  }
}
