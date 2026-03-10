import { describe, it, expect } from 'vitest';
import { TextProcessor } from '../../src/text-processor';

describe('TextProcessor', () => {
    describe('validateText', () => {
        it('should return Text_Valid for valid text', () => {
            expect(TextProcessor.validateText('Hello world')).toBe('Text_Valid');
        });

        it('should return Text_Empty for empty string', () => {
            expect(TextProcessor.validateText('')).toBe('Text_Empty');
        });

        it('should return Text_Empty for whitespace only', () => {
            expect(TextProcessor.validateText('   ')).toBe('Text_Empty');
        });

        it('should return Excessive_Text_Length for text > 10000 chars', () => {
            const longText = 'a'.repeat(10001);
            expect(TextProcessor.validateText(longText)).toBe('Excessive_Text_Length');
        });

        it('should return Excessive_Word_Length for word > 50 chars', () => {
            const longWord = 'a'.repeat(51);
            expect(TextProcessor.validateText(longWord)).toBe('Excessive_Word_Length');
        });
    });

    describe('chunkText', () => {
        it('should split text into sentences', () => {
            const text = 'Hello world. This is a test.';
            const chunks = TextProcessor.chunkText(text);
            expect(chunks).toEqual(['Hello world.', 'This is a test.']);
        });

        it('should handle complex punctuation', () => {
            const text = 'Hello! How are you? I am fine.';
            const chunks = TextProcessor.chunkText(text);
            expect(chunks).toEqual(['Hello!', 'How are you?', 'I am fine.']);
        });
    });
});
