// src/core/services/daily_notes/parse/HeadingSpecResolver.ts
import { HeadingSpecRegistry } from 'src/core/models/daily_notes/specs/HeadingSpecRegistry';
import { HeadingNormalizer } from './HeadingNormalizer';
import { HeadingSpec } from 'src/core/models/daily_notes/specs/HeadingSpec';

export class HeadingSpecResolver {
  // src/core/services/daily_notes/parse/HeadingSpecResolver.ts

  static resolve(line: string): {
    spec?: HeadingSpec;
    level: number;
    suffix?: string;
  } {
    line = line.replace(/\r$/, '');
    const m = line.match(/^(#+)\s*(.+)$/);
    if (!m) return { level: 0 };

    const level = m[1].length;
    const raw = m[2];

    const normalized = HeadingNormalizer.normalize(raw);

    for (const { spec, label } of HeadingSpecRegistry.sectionLabels()) {
      if (spec.level !== level) continue;

      const normalizedLabel = HeadingNormalizer.normalize(label);

      if (!normalized.startsWith(normalizedLabel)) continue;

      // ★ 修正: label.length で切らず、normalizedLabel と一致する raw の消費位置を求める
      const cutIndex = this.findRawCutIndexByNormalizedPrefix(raw, normalizedLabel);
      if (cutIndex == null) {
        // フォールバック（基本は起きない）：現行互換
        const rest = raw.slice(label.length);
        return { spec, level, suffix: rest.length > 0 ? rest : undefined };
      }

      const rest = raw.slice(cutIndex);
      return { spec, level, suffix: rest.length > 0 ? rest : undefined };
    }
    return { level };
  }

  /**
   * raw を先頭から消費し、normalize(consumed) が normalizedPrefix と一致する
   * 最短の raw 切断位置（code unit index）を返す。
   *
   * - 絵文字 Variation Selector / ゼロ幅文字 / 余分な空白など、normalize で消える差分があってもズレない。
   */
  private static findRawCutIndexByNormalizedPrefix(raw: string, normalizedPrefix: string): number | null {
    // code point 単位で進める（surrogate pair を壊さない）
    const cps = Array.from(raw);

    let consumedRaw = '';
    for (let i = 0; i < cps.length; i++) {
      consumedRaw += cps[i];

      const consumedNorm = HeadingNormalizer.normalize(consumedRaw);

      // 正規化した結果が prefix に到達したら判定
      if (consumedNorm.length < normalizedPrefix.length) continue;

      if (consumedNorm === normalizedPrefix) {
        // consumedRaw の code unit 長が slice の index になる
        return consumedRaw.length;
      }

      // normalize の仕様次第で「一気に短くなる」ことがあるので、超えたら打ち切り
      if (!normalizedPrefix.startsWith(consumedNorm)) {
        break;
      }
    }

    return null;
  }
}
