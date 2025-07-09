import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { renderUI, type UIElements } from './ui-manager';
import { initialState, type AppState } from './state';
import { stateReducer, type Action } from './state-reducer';

// Setup a simulated DOM environment for testing
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <main>
        <h1>Ron Reade</h1>
        <p><label for="ron_text">Enter text:</label></p>
        <textarea name="ron_text" id="ron_text" rows="20" cols="33" placeholder="Enter text here"></textarea>
        <div class="button-group">
          <button id="process_text_button" type="button" disabled>Create Speech</button>
          <button id="clear_button" type="button" disabled>Clear Text</button>
          <button id="halt_button" type="button" disabled>Halt Processing</button>
        </div>
        <audio id="audio_output" controls></audio>
        <p id="status_report">Downloading artificial neural network...</p>
        <progress id="progress_bar" width: 100%;"></progress>
      </main>
    </body>
  </html>
`);

globalThis.document = dom.window.document;
globalThis.window = dom.window as any;

// A helper function to get all the UI elements from the DOM
const getUIElements = (): UIElements => ({
  ronText: document.getElementById('ron_text') as HTMLTextAreaElement,
  processTextButton: document.getElementById('process_text_button') as HTMLButtonElement,
  clearButton: document.getElementById('clear_button') as HTMLButtonElement,
  haltButton: document.getElementById('halt_button') as HTMLButtonElement,
  audioOutput: document.getElementById('audio_output') as HTMLAudioElement,
  progressBar: document.getElementById('progress_bar') as HTMLProgressElement,
  statusReport: document.getElementById('status_report') as HTMLParagraphElement,
});

describe('UI Manager: renderUI', () => {

  // Reset the DOM to its initial state before each test
  beforeEach(() => {
    const elements = getUIElements();
    elements.ronText.value = '';
    document.body.innerHTML = dom.window.document.body.innerHTML;
  });

  describe('Initial & Idle States', () => {
    it('should render the UI correctly for the initial "modelLoading" state', () => {
      const elements = getUIElements();
      renderUI(elements, initialState);

      expect(elements.statusReport.textContent).toBe('Downloading artificial neural network...');
      expect(elements.processTextButton.disabled).toBe(true);
      expect(elements.haltButton.disabled).toBe(true);
      expect(elements.audioOutput.style.opacity).toBe('0.4');
      expect(elements.clearButton.disabled).toBe(true);
    });

    it('should enable the process button when idle and text is present', () => {
      const elements = getUIElements();
      elements.ronText.value = 'Some new text';
      const state: AppState = { ...initialState, audioLifecycle: 'idle' };
      renderUI(elements, state);

      expect(elements.processTextButton.disabled).toBe(false);
      expect(elements.statusReport.textContent).toBe('Ready to convert your text into speech.');
    });

    it('should disable the process button when idle and text is empty', () => {
      const elements = getUIElements();
      const state: AppState = { ...initialState, audioLifecycle: 'idle' };
      renderUI(elements, state);

      expect(elements.processTextButton.disabled).toBe(true);
      expect(elements.statusReport.textContent).toBe('Please enter text to be read aloud.');
    });
  });

  describe('Processing State', () => {
    it('should show the correct UI when processing text', () => {
      const elements = getUIElements();
      const state: AppState = { ...initialState, audioLifecycle: 'processing' };
      renderUI(elements, state);

      expect(elements.processTextButton.disabled).toBe(true);
      // Halt button enabled
      expect(elements.haltButton.disabled).toBe(false);
      expect(elements.statusReport.textContent?.toLowerCase()).toContain('processing');
      expect(elements.audioOutput.style.opacity).toBe('0.4');

    });
  });

  describe('Playback States', () => {
    it('should show the audio player when ready to play', () => {
      const elements = getUIElements();
      const state: AppState = { ...initialState, audioLifecycle: 'readyToPlay' };
      renderUI(elements, state);

      expect(elements.processTextButton.disabled).toBe(true);
      expect(elements.audioOutput.style.opacity).toBe('1');
      expect(elements.statusReport.textContent).toBe('Please press the play button on the audio player.');
    });

    it('should update the UI correctly when playing', () => {
      const elements = getUIElements();
      const state: AppState = { ...initialState, audioLifecycle: 'playing' };
      renderUI(elements, state);

      expect(elements.processTextButton.disabled).toBe(true);
      expect(elements.statusReport.textContent).toBe('Playback in progress...');
    });

    it('should enable the process button if paused and new text is entered', () => {
      const elements = getUIElements();
      elements.ronText.value = 'A new thought occurred to me.';
      const state: AppState = { ...initialState, audioLifecycle: 'paused' };
      renderUI(elements, state);

      expect(elements.processTextButton.disabled).toBe(false); // The key check
      expect(elements.statusReport.textContent).toBe('Playback paused. Ready to process new text.');
    });
  });

  describe('Error State', () => {
    it('should display an error message and disable controls in the error state', () => {
      const elements = getUIElements();
      const errorMessage = 'We encountered a fault.';
      const state: AppState = { ...initialState, audioLifecycle: 'error', errorMessage: errorMessage };
      renderUI(elements, state);

      expect(elements.statusReport.textContent).toBe(errorMessage);
      expect(elements.processTextButton.disabled).toBe(true);
      expect(elements.haltButton.disabled).toBe(true);
    });
  });

});

describe('UI Manager: Full Interaction Loop', () => {
  let state: AppState;
  let elements: UIElements;

  const dispatch = (action: Action) => {
    state = stateReducer(state, action);
    renderUI(elements, state);
  };

  // This function mimics setupEventListeners from main.ts for our tests
  const setupTestEventListeners = () => {
    elements.ronText.addEventListener('input', () => {
      dispatch({ type: 'USER_INPUT_TEXT' });
    });

    elements.clearButton.addEventListener('click', () => {
      elements.ronText.value = '';
      dispatch({ type: 'USER_CLEARED_TEXT' });
    });

    elements.processTextButton.addEventListener('click', () => {
      // Only dispatch if the button is not disabled
      if (!elements.processTextButton.disabled) {
        dispatch({ type: 'PROCESS_TEXT_SUBMITTED', payload: { totalChunks: 1 } });
      }
    });
  };

  beforeEach(() => {
    state = { ...initialState };
    document.body.innerHTML = dom.window.document.body.innerHTML;
    elements = getUIElements();
    setupTestEventListeners(); // Set up listeners for each test
    renderUI(elements, state);
  });

  describe('User Input and Clearing', () => {
    it('should enable process and clear buttons when user types text', () => {
      state.audioLifecycle = 'idle'; // Set app to a ready state
      renderUI(elements, state);

      // Pre-condition
      expect(elements.processTextButton.disabled).toBe(true);
      expect(elements.clearButton.disabled).toBe(true);

      // Action: Simulate user typing. The listener will now automatically call dispatch.
      elements.ronText.value = 'Hello world';
      elements.ronText.dispatchEvent(new dom.window.Event('input', { bubbles: true }));

      // Assertions

      expect(elements.processTextButton.disabled).toBe(false);
      expect(elements.clearButton.disabled).toBe(false);
    });

    it('should clear text and disable buttons when clear is clicked', () => {
      // Setup
      state.audioLifecycle = 'idle';
      elements.ronText.value = 'Hello world';
      elements.ronText.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
      expect(elements.clearButton.disabled).toBe(false); // Sanity check

      // Action: Simulate user clicking clear. The listener handles the logic.
      elements.clearButton.click();

      // Assertions

      expect(elements.ronText.value).toBe('');
      expect(elements.processTextButton.disabled).toBe(true);
      expect(elements.clearButton.disabled).toBe(true);
    });
  });

  describe('Processing Flow', () => {
    it('should transition UI to "processing" state on "Create Speech" click', () => {
      // Setup
      state.audioLifecycle = 'idle';
      elements.ronText.value = 'Test text';
      elements.ronText.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
      expect(elements.processTextButton.disabled).toBe(false);

      // Action: Simulate the click.
      elements.processTextButton.click();

      // Assertions
      expect(state.audioLifecycle).toBe('processing');

      expect(elements.haltButton.disabled).toBe(false);
      expect(elements.statusReport.textContent?.toLowerCase()).toContain('processing');
    });
  });
});