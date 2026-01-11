import { TagAliases } from "src/core/models/tags/TagAliases";

export type NormalizedTags = {
  normalized: string[];
  newTags: string[];
};

export class TagNormalizationService {
  /**
   * タグを正規化し、新規タグとの差分を返す
   * - tags が未指定／非配列の場合は空として扱う
   */
  normalize(
    tags: unknown,
    aliases: TagAliases
  ): NormalizedTags {
    if (!Array.isArray(tags)) {
      return { normalized: [], newTags: [] };
    }

    return aliases.normalizeAndRegisterWithDiff(tags);
  }
}
