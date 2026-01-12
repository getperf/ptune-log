// File: src/features/note_analysis/services/KptPromptBuilder.ts

import { KptSource } from '../models/KptSource';

export class KptPromptBuilder {
  static build(source: KptSource): string {
    return `
以下は1日の振り返りデータです。

## タスクの振り返り要約
${source.taskReviewSummary}

## ノートの振り返り要約
${source.noteReviewSummary}

上記内容をもとに、KPT（Keep / Problem / Try）を整理してください。
推測や一般論は行わず、記載内容から読み取れる事実のみを使用してください。
`.trim();
  }
}
