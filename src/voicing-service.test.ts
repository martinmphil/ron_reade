import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// --- Mock Setup ---
vi.mock('@huggingface/transformers');

// Import the mocked library once at the top level.
import { pipeline, env } from '@huggingface/transformers';

// Declare the service variable for use in tests.
let service: typeof import('./voicing-service');

// --- Test Suite ---
describe('Voicing Service', () => {

  beforeEach(async () => {
    // Prevent state leakage between tests.
    vi.resetModules();

    vi.clearAllMocks();

    // Reset the mocked env object to a default state.
    Object.assign(env, {
      allowLocalModels: false,
      allowRemoteModels: true,
      useBrowserCache: true
    });

    // Having reset modules, freshly import service before each test
    service = await import('./voicing-service');
  });

  describe('loadModel', () => {
    it('should configure the environment correctly', async () => {
      (pipeline as Mock).mockResolvedValue(vi.fn());
      await service.loadModel();
      expect(env.allowLocalModels).toBe(false);
      expect(env.allowRemoteModels).toBe(true);
      expect(env.useBrowserCache).toBe(true);
    });

    it('should call the pipeline function with the correct parameters', async () => {
      (pipeline as Mock).mockResolvedValue(vi.fn());
      await service.loadModel();
      expect(pipeline).toHaveBeenCalledOnce();
      expect(pipeline).toHaveBeenCalledWith('text-to-speech', 'Xenova/speecht5_tts', {
        dtype: 'fp32',
      });
    });

    it('should handle errors during model loading', async () => {
      const loadError = new Error('Failed to download model');
      (pipeline as Mock).mockRejectedValueOnce(loadError);
      await expect(service.loadModel()).rejects.toThrow(loadError);
    });
  });

  describe('processTextToAudio', () => {
    it('should throw an error if called before the model is loaded', async () => {
      await expect(service.processTextToAudio('test')).rejects.toThrow('Text-to-speech model is not loaded yet.');
    });

    it('should call the synthesizer with the correct parameters on success', async () => {
      const mockSynthesizer = vi.fn();
      const expectedAudioData = new Float32Array([0.1, 0.2, 0.3]);
      mockSynthesizer.mockResolvedValue({ audio: expectedAudioData });
      (pipeline as Mock).mockResolvedValue(mockSynthesizer);

      await service.loadModel();
      const inputText = 'Hello Ron Reade.';
      const result = await service.processTextToAudio(inputText);

      expect(mockSynthesizer).toHaveBeenCalledOnce();
      expect(mockSynthesizer).toHaveBeenCalledWith(inputText, {
        speaker_embeddings: './speaker_embeddings.bin',
      });
      expect(result).toEqual(expectedAudioData);
    });

    it('should handle errors during text processing', async () => {
      const mockSynthesizer = vi.fn();
      const processError = new Error('TTS conversion failed');
      mockSynthesizer.mockRejectedValueOnce(processError);
      (pipeline as Mock).mockResolvedValue(mockSynthesizer);

      await service.loadModel();

      await expect(service.processTextToAudio('test')).rejects.toThrow(processError);
    });
  });
});
