import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Worker class
const mockPostMessage = vi.fn();
const mockTerminate = vi.fn();
let mockWorkerOnmessage: (event: any) => void;

const mockWorker = {
  postMessage: mockPostMessage,
  terminate: mockTerminate,
  set onmessage(handler: (event: any) => void) {
    mockWorkerOnmessage = handler;
  },
  get onmessage() {
    return mockWorkerOnmessage;
  },
};

vi.stubGlobal('Worker', vi.fn(() => mockWorker));

describe('Voicing Service', () => {
  let service: typeof import('./voicing-service');

  beforeEach(async () => {
    // Reset modules to ensure a clean state for each test
    vi.resetModules();
    // Dynamically import the service to get a fresh instance
    service = await import('./voicing-service');
    vi.clearAllMocks();
  });

  it('should create a new worker on initialization', () => {
    service.initializeVoicingService();
    expect(Worker).toHaveBeenCalledWith(expect.any(URL), { type: 'module' });
    expect(Worker).toHaveBeenCalledTimes(1);
  });

  it('should terminate the existing worker if initialised again', () => {
    service.initializeVoicingService(); // First call
    expect(Worker).toHaveBeenCalledTimes(1);

    service.initializeVoicingService(); // Second call
    expect(mockTerminate).toHaveBeenCalledTimes(1);
    expect(Worker).toHaveBeenCalledTimes(2);
  });

  describe('loadModel', () => {
    beforeEach(() => {
      service.initializeVoicingService();
    });

    it('should post a "loadModel" message to the worker', () => {
      service.loadModel();
      expect(mockPostMessage).toHaveBeenCalledWith({ type: 'loadModel' });
    });

    it('should resolve the promise on "modelLoadSuccess" message', async () => {
      const loadPromise = service.loadModel();
      mockWorker.onmessage({ data: { type: 'modelLoadSuccess' } });
      await expect(loadPromise).resolves.toBeUndefined();
    });

    it('should reject the promise on "processingFailure" message', async () => {
      const loadPromise = service.loadModel();
      const errorMessage = 'Failed to load model';
      mockWorker.onmessage({ data: { type: 'processingFailure', payload: errorMessage } });
      await expect(loadPromise).rejects.toBe(errorMessage);
    });
  });

  describe('processTextToAudio', () => {
    const testText = 'Hello, world!';

    beforeEach(() => {
      service.initializeVoicingService();
    });

    it('should post a "processText" message with the correct payload', () => {
      service.processTextToAudio(testText);
      expect(mockPostMessage).toHaveBeenCalledWith({ type: 'processText', payload: testText });
    });

    it('should resolve with audio data on "processingSuccess" message', async () => {
      const processPromise = service.processTextToAudio(testText);
      const mockAudio = new Float32Array([1, 2, 3]);
      mockWorker.onmessage({ data: { type: 'processingSuccess', payload: mockAudio } });
      await expect(processPromise).resolves.toEqual(mockAudio);
    });

    it('should reject the promise on "processingFailure" message', async () => {
      const processPromise = service.processTextToAudio(testText);
      const errorMessage = 'TTS failed';
      mockWorker.onmessage({ data: { type: 'processingFailure', payload: errorMessage } });
      await expect(processPromise).rejects.toBe(errorMessage);
    });
  });
});
