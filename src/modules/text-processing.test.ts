import { describe, it, expect } from 'vitest';
import { chunkText } from './text-processing';

describe('chunkText', () => {

  it('should split a simple string by full stops', () => {
    const inputText = 'Hello world. This is Ron Reade.';
    const expectedChunks = ['Hello world.', 'This is Ron Reade.'];
    expect(chunkText(inputText)).toEqual(expectedChunks);
  });

  it('should treat text with no full stops as a single chunk', () => {
    const inputText = 'This is a single sentence without a full stop';
    const expectedChunks = ['This is a single sentence without a full stop'];
    expect(chunkText(inputText)).toEqual(expectedChunks);
  });

  it('should handle multiple spaces around full stops and trim chunks', () => {
    const inputText = 'First sentence.  Second sentence.   ';
    const expectedChunks = ['First sentence.', 'Second sentence.'];
    expect(chunkText(inputText)).toEqual(expectedChunks);
  });

  it('should return an empty array for empty or whitespace-only input', () => {
    expect(chunkText('')).toEqual([]);
    expect(chunkText('   ')).toEqual([]);
  });

  it('should split text at the 1000 character limit if no full stop is found', () => {
    const longText = 'a'.repeat(1001); // 1001 characters
    const expectedChunks = ['a'.repeat(1000), 'a'.repeat(1)];
    expect(chunkText(longText)).toEqual(expectedChunks);
  });

  it('should prioritize splitting by a full stop over the 1000 character limit', () => {
    const text = 'a'.repeat(500) + '. ' + 'b'.repeat(600);
    const expectedChunks = ['a'.repeat(500) + '.', 'b'.repeat(600)];
    expect(chunkText(text)).toEqual(expectedChunks);
  });

  it('should correctly chunk text with a mix of long sentences and full stops', () => {
    const part1 = 'a'.repeat(1000); // First chunk
    const part2 = 'b'.repeat(200) + '. '; // Second chunk
    const part3 = 'c'.repeat(1001); // Third and fourth chunks
    const inputText = part1 + part2 + part3;

    const expectedChunks = [
      'a'.repeat(1000),
      'b'.repeat(200) + '.',
      'c'.repeat(1000),
      'c'.repeat(1),
    ];

    expect(chunkText(inputText)).toEqual(expectedChunks);
  });

});