// @ts-nocheck

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock the dependencies of main.ts
vi.mock('./voicing-service', () => ({
  initializeVoicingService: vi.fn(),
  loadModel: vi.fn().mockResolvedValue(undefined),
  processTextToAudio: vi.fn(),
}));

// Mock stateReducer to spy on its calls
vi.mock('./state-reducer', async () => {
  const actual: typeof import('./state-reducer') = await vi.importActual('./state-reducer');
  return {
    ...actual,
    stateReducer: vi.fn(actual.stateReducer), // Spy on the original stateReducer
  };
});

// Mock chunkText to ensure it returns an array of chunks
vi.mock('./chunk-text', () => ({
  chunkText: vi.fn((text) => {
    if (!text) return [];
    // Simulate chunking into 2 chunks for testing purposes
    return [text.substring(0, text.length / 2), text.substring(text.length / 2)];
  }),
}));

// Mock wav-encoder
vi.mock('./wav-encoder', () => ({
  encodeWav: vi.fn(() => new Blob(['mock_wav_data'], { type: 'audio/wav' })),
}));

// Mock URL.createObjectURL globally
const mockCreateObjectURL = vi.fn(() => 'blob:mock/audio-url');
Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: vi.fn(),
  },
  writable: true,
});

// Helper to create a mock DOM element with necessary properties and spies
interface MockStyle { opacity: string; setProperty: ReturnType<typeof vi.fn>; }

interface MockClassList {
  add: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
  contains: ReturnType<typeof vi.fn>;
}

interface MockHTMLElement {
  id: string;
  tagName: string;
  value?: any; // For textarea/input and progress bar
  src?: string; // For audio
  style: MockStyle;
  classList: MockClassList;
  click: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  triggerInputEvent?: ReturnType<typeof vi.fn>; // Only for mockRonText
  textContent: string | null; // For statusReport, explicitly allow null
  // Minimal properties to satisfy HTMLElement for getElementById mock
  querySelector: ReturnType<typeof vi.fn>;
  // Add properties for HTMLAudioElement
  paused?: boolean;
  ended?: boolean;
  play?: ReturnType<typeof vi.fn>;
  pause?: ReturnType<typeof vi.fn>;
}

const createMockElement = (id: string, tagName: string = 'div'): MockHTMLElement => {
  const listeners: { [key: string]: Function[] } = {}; // To store event listeners

  const element: MockHTMLElement = {
    id: id,
    tagName: tagName.toUpperCase(),
    style: { opacity: '', setProperty: vi.fn() },
    classList: { // Mock classList
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(() => false),
    },
    addEventListener: vi.fn((event: string, callback: Function) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
    }),
    removeEventListener: vi.fn((event: string, callback: Function) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(cb => cb !== callback);
      }
    }),
    click: vi.fn(() => {
      if (listeners['click']) {
        listeners['click'].forEach(callback => callback());
      }
    }),
    textContent: null, // Initialize textContent
    querySelector: vi.fn(() => null), // Default querySelector
  };

  // Add properties based on tagName
  if (tagName === 'textarea' || tagName === 'input') {
    element.value = '';
  } else if (tagName === 'audio') {
    element.src = '';
    element.paused = true;
    element.ended = false;
    element.play = vi.fn(() => {
      element.paused = false;
      if (listeners['play']) listeners['play'].forEach(cb => cb());
    });
    element.pause = vi.fn(() => {
      element.paused = true;
      if (listeners['pause']) listeners['pause'].forEach(cb => cb());
    });
  } else if (tagName === 'progress') {
    element.value = 0; // Progress element value is a number
  }

  if (tagName === 'textarea') {
    element.triggerInputEvent = vi.fn(() => {
      if (listeners['input']) {
        listeners['input'].forEach(callback => callback());
      }
    });
  }

  return element;
};

describe('main.ts', () => {
  // Test for module import side effect (initial DOM population)
  it('should populate the #app element with the initial HTML view on module import', async () => {
    // Ensure a clean DOM for this specific test
    document.body.innerHTML = '<div id="app"></div>';
    // Dynamically import main.ts here to trigger its module-level code
    // This ensures #app is available when main.ts tries to populate it.
    await import('./main');
    const app = document.getElementById('app');
    expect(app).not.toBeNull();
    expect(app!.querySelector('header')).not.toBeNull();
    expect(app!.querySelector('main')).not.toBeNull();
    expect(app!.querySelector('footer')).not.toBeNull();
    expect(app!.querySelector('#ron_text')).not.toBeNull();
    expect(app!.querySelector('#process_text_button')).not.toBeNull();
  });

  describe('after main function initialization', () => {
    let mockRonText: MockHTMLElement;
    let mockProcessTextButton: MockHTMLElement;
    let mockClearButton: MockHTMLElement;
    let mockHaltButton: MockHTMLElement;
    let mockAudioOutput: MockHTMLElement;
    let mockProgressBar: MockHTMLElement;
    let mockStatusReport: MockHTMLElement;

    let stateReducerSpy: vi.Mock;

    beforeEach(async () => {
      vi.clearAllMocks(); // Clear all mocks at the very beginning

      // Create mock DOM elements using the helper
      mockRonText = createMockElement('ron_text', 'textarea');
      mockProcessTextButton = createMockElement('process_text_button', 'button');
      mockClearButton = createMockElement('clear_button', 'button');
      mockHaltButton = createMockElement('halt_button', 'button');
      mockAudioOutput = createMockElement('audio_output', 'audio');
      mockProgressBar = createMockElement('progress_bar', 'progress');
      mockStatusReport = createMockElement('status_report', 'p');
      mockStatusReport.textContent = ''; // Initialize textContent

      // Mock document.getElementById to return our mock elements
      vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
        switch (id) {
          case 'ron_text': return mockRonText;
          case 'process_text_button': return mockProcessTextButton;
          case 'clear_button': return mockClearButton;
          case 'halt_button': return mockHaltButton;
          case 'audio_output': return mockAudioOutput;
          case 'progress_bar': return mockProgressBar;
          case 'status_report': return mockStatusReport;
          default: return null;
        }
      });

      // Set up a basic DOM environment
      document.body.innerHTML = '<div id="app"></div>';

      // Use fake timers to control setTimeout/setInterval
      vi.useFakeTimers();

      // Dynamically import main.ts to ensure its module-level code runs
      const mainModule = await import('./main');

      // Manually call main() to initialize the app
      mainModule.main();

      // Flush microtask queue to allow loadModel to resolve and clearInterval to be scheduled
      await Promise.resolve();

      // Run all pending timers to ensure initializeModel completes
      vi.runAllTimers();

      // Get the spy on stateReducer from the mocked module
      const { stateReducer: importedStateReducer } = await import('./state-reducer');
      stateReducerSpy = importedStateReducer as vi.Mock;


    });

    afterEach(() => {
      vi.useRealTimers(); // Restore real timers after each test
      vi.restoreAllMocks(); // Restore all mocks after each test
    });

    it('should gracefully handle empty text submission', async () => {
      // Set the text area value to empty
      mockRonText.value = '';

      // Simulate a click on the process button
      mockProcessTextButton.click();

      // Assert that PROCESS_TEXT_SUBMITTED action was NOT dispatched
      expect(stateReducerSpy).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ type: 'PROCESS_TEXT_SUBMITTED' })
      );
    });

    it('should clear the text area on "Clear" button click', async () => {
      // Set some initial text
      mockRonText.value = 'Some text to clear';

      // Simulate a click on the clear button
      mockClearButton.click();

      // Assert that the text area value is cleared
      expect(mockRonText.value).toBe('');

      // Assert that USER_CLEARED_TEXT action was dispatched
      expect(stateReducerSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ type: 'USER_CLEARED_TEXT' })
      );
    });

    it('should dispatch USER_INPUT_TEXT when user types', async () => {
      // Simulate user typing by changing the value and triggering an input event
      mockRonText.value = 'Hello, world!';
      (mockRonText.addEventListener as vi.Mock).mock.calls.find(
        ([event]: [string]) => event === 'input'
      )![1](); // Manually trigger the input event listener

      // Assert that USER_INPUT_TEXT action was dispatched
      expect(stateReducerSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ type: 'USER_INPUT_TEXT' })
      );
    });

    it('should orchestrate the entire TTS pipeline on button click', async () => {
      const testText = 'Hello, world!';
      mockRonText.value = testText;

      // Mock processTextToAudio to return a dummy Float32Array
      const { processTextToAudio } = await import('./voicing-service');
      (processTextToAudio as vi.Mock).mockResolvedValue(new Float32Array([0.1, 0.2, 0.3]));

      // Simulate click
      mockProcessTextButton.click();

      // Wait for all promises and timers to resolve
      await vi.runAllTimersAsync();
      await Promise.resolve();

      // Assert initial dispatch for PROCESS_TEXT_SUBMITTED
      expect(stateReducerSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ type: 'PROCESS_TEXT_SUBMITTED', payload: { totalChunks: 2 } })
      );

      // Assert that processTextToAudio was called for each chunk
      expect(processTextToAudio).toHaveBeenCalledTimes(2);

      // Assert that PROCESSING_CHUNK_SUCCESS was dispatched for each chunk
      expect(stateReducerSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ type: 'PROCESSING_CHUNK_SUCCESS' })
      );

      // Assert that encodeWav was called
      const { encodeWav } = await import('./wav-encoder');
      expect(encodeWav).toHaveBeenCalled();

      // Assert that URL.createObjectURL was called
      expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));

      // Assert that audio output src is set
      expect(mockAudioOutput.src).toBe('blob:mock/audio-url');

      // Assert final dispatch for PROCESSING_SUCCESS
      expect(stateReducerSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ type: 'PROCESSING_SUCCESS', payload: testText })
      );
    });
  });
});