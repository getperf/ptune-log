// File: src/i18n/en/settings_llm.ts

export const settingsLlmEn = {
  sectionTitle: 'LLM tag generation',

  provider: {
    name: 'Provider',
    desc: 'Select LLM provider',
    options: {
      'OpenAI Chat': 'OpenAI Chat',
      'Anthropic Claude': 'Anthropic Claude',
      Gemini: 'Gemini',
      Custom: 'Custom',
    },
  },

  apiKey: {
    name: 'API Key',
    desc: 'Enter your provider API key',
    placeholder: 'sk-...',
  },

  baseUrl: {
    name: 'Base URL',
    desc: 'API base URL',
  },

  model: {
    name: 'Model',
    desc: 'Model name',
  },

  embeddingModel: {
    name: 'Embedding model',
    desc: 'Used for tag similarity/vector generation. Choose "Disabled" to turn off. (OpenAI only)',
    options: {
      '': 'Disabled',
      'text-embedding-3-small': 'text-embedding-3-small',
      'text-embedding-3-large': 'text-embedding-3-large',
    },
  },

  temperature: {
    name: 'Temperature',
    desc: 'Output diversity (0.0 = deterministic, 1.0 = creative)',
  },

  maxTokens: {
    name: 'Max tokens',
    desc: 'Maximum number of output tokens',
    placeholder: '512',
  },

  minSimilarityScore: {
    name: 'Min similarity score',
    desc: 'Lower bound for similar tag search (0.0–1.0). Higher = stricter.',
  },

  enableChecklist: {
    name: 'Use checklist in review report',
    desc: 'Render summary/goals as checkboxes; unchecked items are excluded from analysis.',
  },

  promptTemplate: {
    name: 'Prompt template',
    desc: (notePath: string) =>
      `Select a registered prompt template and save it.\n` +
      `Saved to: ${notePath}\n` +
      `Use the buttons on the right to open and edit the template.`,
    buttons: {
      select: 'Select template',
      open: 'Open template',
    },
    noticeNotFound: (notePath: string) => `Note not found: ${notePath}`,
  },

  promptPreview: {
    name: 'Prompt preview',
    desc: 'After editing a template, preview the final prompt sent to the LLM (developer feature).',
    button: 'Show preview',
    noticeOpen: 'Opening prompt preview',
    noticeFail: '⚠️ Failed to run prompt preview',
  },
} as const;
