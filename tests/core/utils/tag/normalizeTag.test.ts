// We recommend installing an extension to run jest tests.

import {
  normalizeTag,
  normalizeTagForCompare,
} from 'src/core/utils/tag/normalizeTag';

describe('normalizeTagForCompare', () => {
  test('trims, removes leading #, strips spaces/hyphens/underscores and lowercases', () => {
    const input = '  #FOO Bar ';
    const expected = 'foobar';
    expect(normalizeTagForCompare(input)).toBe(expected);
  });

  test('converts full-width alphanumerics to ASCII, removes separators and lowercases', () => {
    // full-width characters: Ｈｅｌｌｏ_ＷＯＲＬＤ-１２３
    const input = 'Ｈｅｌｌｏ_ＷＯＲＬＤ-１２３';
    const expected = 'helloworld123';
    expect(normalizeTagForCompare(input)).toBe(expected);
  });

  test('removes multiple separators (spaces, hyphens, underscores)', () => {
    const input = 'Tag - with__spaces  and -underscores';
    const expected = 'tagwithspacesandunderscores';
    expect(normalizeTagForCompare(input)).toBe(expected);
  });

  test('only removes leading hash, preserves internal hashes', () => {
    const input = '#foo#bar';
    const expected = 'foo#bar';
    expect(normalizeTagForCompare(input)).toBe(expected);
  });

  test('converts full-width digits and removes separators', () => {
    const input = '  ００１_test ';
    const expected = '001test';
    expect(normalizeTagForCompare(input)).toBe(expected);
  });

  test('empty or whitespace-only input returns empty string', () => {
    expect(normalizeTagForCompare('   ')).toBe('');
    expect(normalizeTagForCompare('')).toBe('');
  });
});
describe('normalizeTag', () => {
  test('trims and removes leading #, preserves internal #, keeps hyphens/underscores and does not lowercase', () => {
    const input = '  #Foo-Bar_baz#QUX ';
    const expected = 'Foo-Bar_baz#QUX';
    expect(normalizeTag(input)).toBe(expected);
  });

  test('converts full-width alphanumerics to ASCII and removes spaces (but keeps hyphens/underscores)', () => {
    // full-width characters: Ｈｅｌｌｏ ＷＯＲＬＤ-１２３
    const input = ' Ｈｅｌｌｏ ＷＯＲＬＤ-１２３ ';
    const expected = 'HelloWORLD-123';
    expect(normalizeTag(input)).toBe(expected);
  });

  test('only removes leading hash and preserves internal hashes', () => {
    const input = '#foo#bar';
    const expected = 'foo#bar';
    expect(normalizeTag(input)).toBe(expected);
  });

  test('empty or whitespace-only input returns empty string', () => {
    expect(normalizeTag('   ')).toBe('');
    expect(normalizeTag('')).toBe('');
  });
});

describe('normalizeTagForCompare (additional cases)', () => {
  test("when tag contains path segments separated by '/', uses the last segment for normalization", () => {
    const input = 'namespace/subspace/  #Tag-Name_123 ';
    expect(normalizeTagForCompare(input)).toBe('tagname123');
  });
});
