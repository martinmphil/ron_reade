import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as worker from './voicing.worker';
import { pipeline } from '@huggingface/transformers';

// Mock the entire transformers library
vi.mock('@huggingface/transformers', () => ({
  pipeline: vi.fn(),
  env: {
    allowLocalModels: true,
    allowRemoteModels: true,
    useBrowserCache: true,
  },
}));

// Mock the global 'self' for the worker environment
globalThis.self = {
  postMessage: vi.fn(),
  addEventListener: vi.fn(),
} as any;

describe('Voicing Worker Logic', () => {

  beforeEach(() => {
    vi.resetAllMocks();
    // Reset the synthesizer state before each test
    worker.setSynthesizer(null);
  });

  describe('loadModel', () => {
    it('should call the pipeline and set the synthesizer on success', async () => {
      const mockSynthesizer = vi.fn();
      (pipeline as any).mockResolvedValue(mockSynthesizer);

      await worker.loadModel();

      expect(pipeline).toHaveBeenCalledWith('text-to-speech', 'Xenova/speecht5_tts', { dtype: 'fp32' });
      expect(worker.getSynthesizer()).toBe(mockSynthesizer);
    });

    it('should throw an error if the pipeline function fails', async () => {
      const testError = new Error('Model loading failed');
      (pipeline as any).mockRejectedValue(testError);

      await expect(worker.loadModel()).rejects.toThrow('Model loading failed');
    });
  });

  describe('processTextToAudio', () => {
    const mockSynthesizer = vi.fn();

    it('should throw an error if the model is not loaded', async () => {
      // Synthesizer is null by default in beforeEach
      await expect(worker.processTextToAudio('test')).rejects.toThrow('Text-to-speech model is not loaded yet.');
    });

    it('should call the synthesizer with correct text and embeddings', async () => {
      worker.setSynthesizer(mockSynthesizer);
      const testText = 'Hello, this is a test.';
      const mockAudio = new Float32Array([0.1, 0.2, 0.3]);
      mockSynthesizer.mockResolvedValue({ audio: mockAudio });

      await worker.processTextToAudio(testText);

      expect(mockSynthesizer).toHaveBeenCalledWith(testText, {
        speaker_embeddings: '/demo/ron-reade/speaker_embeddings.bin',
      });
    });

    it('should return audio data on successful processing', async () => {
      worker.setSynthesizer(mockSynthesizer);
      const testText = 'Another test.';
      const mockAudio = new Float32Array([0.4, 0.5, 0.6]);
      mockSynthesizer.mockResolvedValue({ audio: mockAudio });

      const result = await worker.processTextToAudio(testText);

      expect(result).toEqual(mockAudio);
    });

    it('should throw an error if the synthesizer fails', async () => {
      worker.setSynthesizer(mockSynthesizer);
      const testError = new Error('Processing failed');
      mockSynthesizer.mockRejectedValue(testError);

      await expect(worker.processTextToAudio('failing text')).rejects.toThrow('Processing failed');
    });
  });
});
