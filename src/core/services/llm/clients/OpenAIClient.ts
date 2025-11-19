import { LLMSettings } from 'src/config/LLMSettings';
import { LLMClientError } from './LLMClientError';
import { logger } from '../../logger/loggerInstance';

/** OpenAI系モデル（Chat / Embedding） */
export class OpenAIClient {
  constructor(private settings: LLMSettings) {}

  /** Chat 呼び出し */
  async callChat(system: string, user: string): Promise<string | null> {
    const { apiKey, baseUrl, model, temperature, maxTokens } = this.settings;
    logger.debug(`[OpenAIClient.callChat] model=${model}`);

    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          temperature: temperature ?? 0.1,
          max_tokens: maxTokens ?? 1024,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      });
      if (!res.ok) throw new LLMClientError(`OpenAI Chat error: ${res.status}`);
      const json = await res.json();
      return json.choices?.[0]?.message?.content ?? null;
    } catch (err) {
      logger.error('[OpenAIClient.callChat] failed', err);
      return null;
    }
  }

  /** Embedding: 単文向け（疎通確認用） */
  async callEmbedding(input: string): Promise<number[] | null> {
    const { apiKey, baseUrl, embeddingModel } = this.settings;
    logger.debug('[OpenAIClient.callEmbedding] start');

    try {
      const res = await fetch(`${baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: embeddingModel,
          input,
        }),
      });
      if (!res.ok)
        throw new LLMClientError(`OpenAI Embedding error: ${res.status}`);
      const json = await res.json();
      return json.data?.[0]?.embedding ?? null;
    } catch (err) {
      logger.error('[OpenAIClient.callEmbedding] failed', err);
      return null;
    }
  }

  /** Embedding: 複数テキスト一括生成 */
  async callEmbeddingBatch(inputs: string[]): Promise<number[][]> {
    const { apiKey, baseUrl, embeddingModel } = this.settings;
    logger.debug(`[OpenAIClient.callEmbeddingBatch] count=${inputs.length}`);

    if (inputs.length === 0) return [];

    try {
      const res = await fetch(`${baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: embeddingModel,
          input: inputs,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new LLMClientError(`EmbeddingBatch error ${res.status}: ${text}`);
      }

      const json = await res.json();
      const vectors = json.data.map((d: any) => d.embedding as number[]);
      logger.debug(
        `[OpenAIClient.callEmbeddingBatch] received ${vectors.length}`
      );
      return vectors;
    } catch (err) {
      logger.error('[OpenAIClient.callEmbeddingBatch] failed', err);
      return [];
    }
  }
}
