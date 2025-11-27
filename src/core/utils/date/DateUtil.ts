export class DateUtil {
  /** ローカル日付に正規化（時刻 00:00:00） */
  static normalizeLocalDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /** UTC ISO文字列（例: 2025-11-11T00:00:00.000Z） */
  static utcString(date: Date = new Date()): string {
    return date.toISOString();
  }

  /** ローカル日付（YYYY-MM-DD） */
  static localDate(date: Date = new Date()): string {
    return date.toLocaleDateString('sv-SE');
  }

  /** YYYY-MM-DD からローカル日付 00:00 の Date を作成 */
  static localDateFromKey(key: string): Date {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d); // ローカル 00:00 固定
  }
  /** ローカル日時 ISO 風 YYYY-MM-DDTHH:mm:ss （タイムゾーン記号なし） */
  static localISOString(date: Date = new Date()): string {
    // Intl でゼロ埋めし、"YYYY-MM-DDTHH:mm:ss" を生成
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${d}T${hh}:${mm}:${ss}`;
  }

  /** ローカル時刻（HH:mm） */
  static localTime(date: Date = new Date()): string {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * ISO文字列 → HH:mm 形式へ変換
   * 空欄やパース失敗時は空文字を返す
   */
  static toTimeHM(utc?: string): string {
    if (!utc) return '';
    const d = new Date(utc);
    if (Number.isNaN(d.getTime())) return '';
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  /** ISO形式の日付文字列を YYYY-MM-DD に変換 */
  static dateKey(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  }

  /** dailynote リンクから日付キーを抽出 */
  static extractDateKeyFromLink(link?: string): string | undefined {
    if (!link) return undefined;
    const m = link.match(/_journal\/(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : undefined;
  }
}
