import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioPlayer } from '../../src/audio-player';

describe('AudioPlayer', () => {
    let audioPlayer: AudioPlayer;
    let mockAudioElement: HTMLAudioElement;

    beforeEach(() => {
        mockAudioElement = document.createElement('audio');
        audioPlayer = new AudioPlayer(mockAudioElement);

        // Mock URL.createObjectURL/revokeObjectURL
        global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should set audio source correctly', () => {
        const mockData = new Float32Array([0, 0, 0]);
        audioPlayer.setAudio(mockData, 16000);

        expect(URL.createObjectURL).toHaveBeenCalled();
        expect(mockAudioElement.src).toBe('blob:mock-url');
        expect(mockAudioElement.hidden).toBe(false);
        expect(mockAudioElement.classList.contains('semitransparent')).toBe(false);
    });

    it('should clear audio correctly', () => {
        mockAudioElement.src = 'blob:old-url';
        audioPlayer.clearAudio();

        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:old-url');
        expect(mockAudioElement.src).toBe('');
        // happy-dom might treat src="" differently than browser, checking attribute removal or empty string
        expect(mockAudioElement.getAttribute('src')).toBeFalsy();
        expect(mockAudioElement.hidden).toBe(true);
        expect(mockAudioElement.classList.contains('semitransparent')).toBe(true);
    });
});
