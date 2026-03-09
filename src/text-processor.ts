export class TextProcessor {
    static readonly MAX_TEXT_LENGTH = 10000;
    static readonly MAX_WORD_LENGTH = 50;
    static readonly IDEAL_CHUNK_LENGTH = 400;

    static validateText(text: string): 'Text_Valid' | 'Text_Empty' | 'Excessive_Text_Length' | 'Excessive_Word_Length' {
        if (!text || text.trim().length === 0) {
            return 'Text_Empty';
        }

        if (text.length > this.MAX_TEXT_LENGTH) {
            return 'Excessive_Text_Length';
        }

        const words = text.split(/\s+/);
        for (const word of words) {
            if (word.length > this.MAX_WORD_LENGTH) {
                return 'Excessive_Word_Length';
            }
        }

        return 'Text_Valid';
    }

    static chunkText(text: string): string[] {
        const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
        const chunks: string[] = [];

        for (const paragraph of paragraphs) {
            chunks.push(...this.chunkParagraph(paragraph));
        }

        return chunks;
    }

    private static chunkParagraph(paragraph: string): string[] {
        // Split by sentence terminators (. ! ?), keeping the terminator
        // Positive lookbehind not fully supported in all regex engines perfectly for split, 
        // so let's match sentences instead.
        // Actually, simple split by sentence boundary.
        // Match sentences ending with punctuation or end of string, accounting for spaces
        // This regex looks for sequences of non-terminators followed by terminators
        const sentences = paragraph.match(/[^.!?]+([.!?]+|$)/g) || [paragraph];
        const chunks: string[] = [];

        for (const sentence of sentences) {
            const trimmed = sentence.trim();
            if (!trimmed) continue;

            if (trimmed.length <= this.IDEAL_CHUNK_LENGTH) {
                chunks.push(trimmed);
            } else {
                chunks.push(...this.chunkSentence(trimmed));
            }
        }

        return chunks;
    }

    private static chunkSentence(sentence: string): string[] {
        const words = sentence.split(/\s+/);
        const chunks: string[] = [];
        let currentChunk = '';

        for (const word of words) {
            if (word.length > this.IDEAL_CHUNK_LENGTH) {
                // This case should be caught by validation, but as a fallback/safety:
                // If a single word is massive (and passed validation logic somehow or validation wasn't called), 
                // we have to push it as is or split it. 
                // The requirement says "The app shall never split a chunk inside a word." 
                // and "Word-Boundary Segmentation... at the nearest word boundary".
                // If a word is > 400 chars, it violates the flow, but we are supposed to validate < 50 chars.
                // So we assume words are < 50 chars.
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                    currentChunk = '';
                }
                chunks.push(word);
                continue;
            }

            if (currentChunk.length + word.length + 1 <= this.IDEAL_CHUNK_LENGTH) {
                currentChunk += (currentChunk ? ' ' : '') + word;
            } else {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = word;
            }
        }

        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }
}
