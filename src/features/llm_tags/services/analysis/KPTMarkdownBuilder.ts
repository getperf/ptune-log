import { KPTResult } from './KPTAnalyzer';

export class KPTMarkdownBuilder {
  static build(result: KPTResult): string {
    const { Keep, Problem, Try } = result;

    const lines: string[] = [
      '### 🧠 KPT分析',
      '',
      '#### Keep',
      ...(Keep.length > 0 ? Keep.map((v) => `- ${v}`) : ['- ']),
      '',
      '#### Problem',
      ...(Problem.length > 0 ? Problem.map((v) => `- ${v}`) : ['- ']),
      '',
      '#### Try',
      ...(Try.length > 0 ? Try.map((v) => `- ${v}`) : ['- ']),
      '',
    ];

    return lines.join('\n');
  }
}
