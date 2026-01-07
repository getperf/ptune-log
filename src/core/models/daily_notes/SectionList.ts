// src/core/models/daily_notes/SectionList.ts

import { Section } from './Section';

export class SectionList {
  readonly items: readonly Section[];

  constructor(items: Section[] = []) {
    this.items = items;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  count(): number {
    return this.items.length;
  }

  /** present なものだけ数える（再実行耐性） */
  presentCount(): number {
    return this.items.filter((s) => s.present).length;
  }

  append(section: Section): SectionList {
    return new SectionList([...this.items, section]);
  }

  map(fn: (s: Section) => Section): SectionList {
    return new SectionList(this.items.map(fn));
  }
}
