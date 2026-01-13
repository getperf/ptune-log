// src/core/utils/markdown/KindCommentBlock.ts

export class KindCommentBlock {
  /** 指定 kind のブロックを抽出 */
  static extract(raw: string, kind: string): string | null {
    const pattern = new RegExp(
      `<!--\\s*kind:${kind}\\s*-->([\\s\\S]*?)<!--\\s*/kind\\s*-->`,
      'm'
    );

    const match = raw.match(pattern);
    return match ? match[1].trim() : null;
  }

  /** 指定 kind のブロックを除去 */
  static remove(raw: string, kind: string): string {
    const pattern = new RegExp(
      `<!--\\s*kind:${kind}\\s*-->[\\s\\S]*?<!--\\s*/kind\\s*-->\\n?`,
      'gm'
    );

    return raw.replace(pattern, '').trim();
  }

  /** すべての kind コメントブロックを除去 */
  static removeAll(raw: string): string {
    // kind コメントブロックを除去
    const withoutKind = raw.replace(
      /<!--\s*kind:[^\s]+\s*-->[\s\S]*?<!--\s*\/kind\s*-->\n?/gm,
      ''
    );

    // 空行を正規化（3行以上 → 2行）
    return withoutKind.replace(/\n{3,}/g, '\n\n').trim();
  }
}
