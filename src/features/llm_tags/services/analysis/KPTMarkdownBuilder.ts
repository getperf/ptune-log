import { KPTResult } from './KPTAnalyzer';

export class KPTMarkdownBuilder {
  static build(kpt: KPTResult, index?: number): string {
    const title =
      index && index > 1 ? `### 🧠 KPT分析(${index})` : '### 🧠 KPT分析';

    return [
      title,
      '',
      '#### Keep',
      ...kpt.Keep.map((k) => `- ${k}`),
      '',
      '#### Problem',
      ...kpt.Problem.map((p) => `- ${p}`),
      '',
      '#### Try',
      ...kpt.Try.map((t) => `- ${t}`),
    ].join('\n');
  }
}
