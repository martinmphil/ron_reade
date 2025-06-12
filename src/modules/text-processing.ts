// src/modules/text-processing.ts

const MAX_CHUNK_LENGTH = 1000;

/**
 * Splits a given string into chunks based on specific rules.
 * Chunks are created at every full stop or when the chunk length
 * exceeds MAX_CHUNK_LENGTH, whichever comes first.
 *
 * @param text The input string to be chunked.
 * @returns An array of string chunks. Returns an empty array for empty input.
 */
export function chunkText(text: string): string[] {
  const trimmedText = text.trim();
  if (!trimmedText) {
    return [];
  }

  const chunks: string[] = [];
  let remainingText = trimmedText;

  while (remainingText.length > 0) {
    // Determine the maximum possible length for the current chunk
    const searchRange = remainingText.substring(0, MAX_CHUNK_LENGTH);

    // Find the first full stop within the search range
    let splitIndex = searchRange.indexOf('.');

    if (splitIndex !== -1) {
      // If a full stop is found, the chunk ends after it
      splitIndex += 1;
    } else if (remainingText.length > MAX_CHUNK_LENGTH) {
      // If no full stop and text is too long, split at the max length
      splitIndex = MAX_CHUNK_LENGTH;
    } else {
      // If no full stop and text is within the limit, the rest is one chunk
      splitIndex = remainingText.length;
    }

    // Extract the chunk and trim any leading/trailing whitespace
    const chunk = remainingText.substring(0, splitIndex).trim();
    if (chunk) { // Avoid adding empty chunks
      chunks.push(chunk);
    }

    // Update the remaining text
    remainingText = remainingText.substring(splitIndex).trim();
  }

  return chunks;
}
