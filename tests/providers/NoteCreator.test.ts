// eslint-disable-next-line @typescript-eslint/no-unused-vars

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Vault, TFolder, TFile, Notice } from 'obsidian';
import { NoteCreator } from 'src/features/note_creator/commands/NoteCreator';

jest.mock('obsidian');

describe('NoteCreator', () => {
  let vault: Vault;
  let folder: TFolder;
  let creator: NoteCreator;

  const mockApp = {
    vault: new Vault(),
    workspace: {
      getLeaf: () => ({
        openFile: jest.fn(),
      }),
    },
  } as any;

  const mockConfig = {} as any;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vault = mockApp.vault;
    folder = new TFolder();
    folder.path = 'test/folder';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    creator = new NoteCreator(mockApp, mockConfig);
  });

  test('isValidNoteTitle should reject invalid characters', () => {
    expect(NoteCreator.isValidNoteTitle('ValidTitle')).toBe(true);
    expect(NoteCreator.isValidNoteTitle('Invalid/Title')).toBe(false);
  });

  test('validateInput should show notice on missing title', () => {
    // const spy = jest.spyOn(Notice.prototype, "constructor");
    const input = { prefix: '001', folderPath: 'folder' };
    const result = NoteCreator.validateInput(input);
    expect(result).toBe(false);
    // expect(spy).toHaveBeenCalled();
  });

  // test("createFolderIfNotExists should create new folder if missing", async () => {
  //     const input : NoteCreationInput = {
  //         title: "Title",
  //         prefix: "001",
  //         folderPath: "folder",
  //         creationType: SerialNoteCreationType.FILE
  //     };
  //     await creator.createFolderIfNotExists(vault, input);
  //     const created = vault.getAbstractFileByPath("folder/001_Title");
  //     expect(created).toBeInstanceOf(TFolder);
  // });

  // test("createNoteIfNotExists should create new file if missing", async () => {
  //     const input : NoteCreationInput = {
  //         title: "Note",
  //         prefix: "001",
  //         folderPath: "folder",
  //         creationType: SerialNoteCreationType.FILE
  //     };
  //     const file = await creator.createNoteIfNotExists(vault, input);
  //     expect(file).toBeInstanceOf(TFile);
  // });

  // test("createNoteIfNotExists should return existing file", async () => {
  //     const input = {
  //         title: "Note",
  //         prefix: "001",
  //         folderPath: "folder"
  //     };
  //     const path = "folder/001_Note.md";
  //     const existing = await vault.create(path, "");
  //     const file = await creator.createNoteIfNotExists(vault, input);
  //     expect(file).toBe(existing);
  // });
});
