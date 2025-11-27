export class ChecklistDecorator {
  constructor(
    private readonly enabled: boolean,
    private readonly prefix: string = '- [ ] '
  ) {}

  apply(line: string): string {
    if (!this.enabled) return line;

    // --- 共通タグ（そのまま prefix を付ける）
    if (/^\s*共通タグ\s*:/.test(line)) {
      return `${this.prefix}${line}`;
    }

    // --- 要約行の強制的な一括整形
    const summaryMatch = line.match(/^\s*[-*]?\s*要約\s*:(.*)$/);
    if (summaryMatch) {
      const body = summaryMatch[1].trim(); // 「:」以降の本文
      return `- [ ] 要約: ${body}`;
    }

    return line;
  }
}
