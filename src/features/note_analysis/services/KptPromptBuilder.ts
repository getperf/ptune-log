// src/features/note_analysis/services/KptPromptBuilder.ts

import { KptSource } from '../models/KptSource';

export interface KptPrompt {
  system: string;
  user: string;
}

export class KptPromptBuilder {
  static build(source: KptSource): KptPrompt {
    const system = `
あなたは「KPT分析を再評価・再構成するAI」です。

## ノート要約の読み取りルール（重要）
ノートの振り返り要約には、以下の種別が付与された行があります。

- ACCEPTED:
  ユーザが否定・修正しなかった内容です。
  事実として暫定的に受け入れられている内容とみなしてください。

- REJECTED:
  ユーザが違和感や誤りを感じ、
  否定または修正が必要だと判断した内容です。
  そのまま Keep として採用しないでください。

- USERCOMMENT:
  LLM要約とは別に、ユーザが追加した補足・評価・判断です。

## 分析方針
- Keep:
  - 主に ACCEPTED から有効だった作業・判断・成果を書く。
- Problem:
  - REJECTED や USERCOMMENT から課題・違和感を書く。
- Try:
  - Problem を解消する次の具体的アクションを書く。
  - 推測ベースの Try は行わない。

## 制約
- 推測や脚色は禁止。
- 入力に書かれている情報のみを根拠にする。

## 出力形式（YAML）
\`\`\`yaml
Keep:
  - ...
Problem:
  - ...
Try:
  - ...
\`\`\`
`.trim();

    const user = `
## タスクの振り返り要約
${source.taskReviewSummary}

## ノートの振り返り要約
${source.noteReviewSummary}
`.trim();

    return { system, user };
  }
}
