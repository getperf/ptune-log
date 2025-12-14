// src/core/utils/daily_note/DailyNoteSectionEditor.ts
export class DailyNoteSectionEditor {
  static replaceSection(
    markdown: string,
    heading: string,
    body: string
  ): string {
    const lines = markdown.split('\n');
    const out: string[] = [];

    let inTarget = false;
    let replaced = false;

    for (const line of lines) {
      if (!inTarget && line.trim() === heading.trim()) {
        inTarget = true;
        replaced = true;
        out.push(line, '', body.trim(), '');
        continue;
      }

      if (inTarget) {
        if (line.startsWith('## ')) {
          inTarget = false;
          out.push(line);
        }
        continue;
      }

      out.push(line);
    }

    if (!replaced) {
      out.push('', heading, '', body.trim());
    }

    return out.join('\n').replace(/\n{3,}/g, '\n\n');
  }
}
