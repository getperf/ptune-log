// File: src/features/daily_review/services/DailyReviewTagListBuilder.ts

import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';

const HEADER_TAG_LIST = '### 📌 タグ一覧（当日生成）';
const HEADER_UNREGISTERED = '### ⚠ 未登録タグ候補（要レビュー）';

export class DailyReviewTagListBuilder {
  static build(summaries: NoteSummaries): string {
    const allTags = summaries.getAllTags();
    const newTags = summaries.getAllUnregisteredTags();

    const lines: string[] = [
      HEADER_TAG_LIST,
      '',
      allTags.map((t) => `#${t}`).join(' '),
    ];

    if (newTags.length > 0) {
      lines.push(
        '',
        HEADER_UNREGISTERED,
        '',
        '※ 未登録タグがあります。',
        '→ コマンド「**エイリアス辞書にタグを登録・マージ**」で名寄せを行ってください。',
        '',
        newTags.map((t) => `#${t}`).join(' ')
      );
    }

    return lines.join('\n') + '\n';
  }
}
