// File: src/i18n/ja/settings_note.ts

export const settingsNoteJa = {
  sectionTitle: 'ノート作成設定',

  folderPrefix: {
    name: 'Note folder prefix',
    desc: 'Prefix type for note folder',
    options: {
      serial: 'Serial',
      date: 'Date',
    },
  },

  notePrefix: {
    name: 'Note prefix',
    desc: 'Prefix type for notes',
    options: {
      serial: 'Serial',
      date: 'Date',
    },
  },

  prefixDigits: {
    name: 'Prefix digits',
    desc: 'Number of digits for the prefix',
  },

  template: {
    name: 'Note template',
    desc: 'Enter the note template.',
    placeholder: 'Template here...',
  },
} as const;
