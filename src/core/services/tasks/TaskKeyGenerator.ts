// File: src/core/services/tasks/TaskKeyGenerator.ts

export class TaskKeyGenerator {
  /** タスクタイトル → taskKey */
  static generate(title: string): string {
    return (
      title
        // 🍅x2 などのメタ情報を除外
        .replace(/🍅x?\d*/g, '')
        // チェック用記号などを除外（必要に応じて拡張）
        .replace(/\[[^\]]*]/g, '')
        // ファイル・ノート禁止文字を除外
        .replace(/[<>:"/\\|?*]/g, '')
        // 空白・区切りを _
        .replace(/[ \t]+/g, '_')
        // 連続 _ を整理
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .trim()
    );
  }

  /** 親 + 子 → 複合 taskKey */
  static generateChild(parentKey: string, childTitle: string): string {
    const childKey = this.generate(childTitle);
    return `${parentKey}_${childKey}`;
  }
}
