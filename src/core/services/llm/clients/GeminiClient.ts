import { LLMSettings } from 'src/config/LLMSettings';
import { LLMClientError } from './LLMClientError';
import { logger } from '../../logger/loggerInstance';
import { LLMClientBase } from './LLMClientBase';

/** Geminiモデルクライアント */
export class GeminiClient implements LLMClientBase {
  constructor(private settings: LLMSettings) {}

  /** Chat呼び出し */
  async callChat(system: string, user: string): Promise<string | null> {
    const { apiKey, baseUrl, model, temperature, maxTokens } = this.settings;
    const url = `${baseUrl}/${model}:generateContent?key=${apiKey}`;
    const fullPrompt = `${system}\n\n${user}`;
    logger.debug(`[GeminiClient.callChat] url=${url}`);

    const body = {
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new LLMClientError(`Gemini Chat error: ${res.status}`);
      const json = await res.json();
      return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } catch (err) {
      logger.error('[GeminiClient.callChat] failed', err);
      return null;
    }
  }

  /** Embedding呼び出し（未実装） */
  async callEmbedding(): Promise<number[] | null> {
    throw new LLMClientError('Gemini embedding 未実装');
  }
}
