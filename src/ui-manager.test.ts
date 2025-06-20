import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { renderUI } from './ui-manager';
import { initialState, type AppState } from './state';

// Setup a simulated DOM environment for testing
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <main>
        <h1>Ron Reade</h1>
        <p><label for="ron_text">Enter text:</label></p>
        <textarea name="ron_text" id="ron_text" rows="20" cols="33" placeholder="Enter text here"></textarea>
        <button id="process_text_button" type="button" disabled>Read Aloud</button>
        <button id="clear_button" type="button" disabled>Clear Text</button>
        <button id="halt_button" type="button" disabled>Halt Processing</button>
        <audio id="audio_output" controls></audio>
        <p id="status_report">Downloading artificial neural network...</p>
      </main>
    </body>
  </html>
`);

// Make the mocked DOM available globally using the modern `globalThis`
globalThis.document = dom.window.document;
globalThis.window = dom.window as any;

describe('UI Manager: renderUI', () => {

  // A helper function to get all the UI elements from the DOM
  const getUIElements = () => ({
    ronText: document.getElementById('ron_text') as HTMLTextAreaElement,
    processTextButton: document.getElementById('process_text_button') as HTMLButtonElement,
    clearButton: document.getElementById('clear_button') as HTMLButtonElement,
    haltButton: document.getElementById('halt_button') as HTMLButtonElement,
    audioOutput: document.getElementById('audio_output') as HTMLAudioElement,
    statusReport: document.getElementById('status_report') as HTMLParagraphElement,
  });

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
      expect(elements.audioOutput.style.display).toBe('none');
      expect(elements.clearButton.disabled).toBe(true);
    });

    it('should enable the process button when idle and text is present', () => {
      const elements = getUIElements();
      elements.ronText.value = 'Some new text';
      const state: AppState = { ...initialState, audioLifecycle: 'idle', inputLifecycle: 'hasRawText' };
      renderUI(elements, state);

      expect(elements.processTextButton.disabled).toBe(false);
      expect(elements.statusReport.textContent).toBe('Ready to convert your text into speech.');
    });

    it('should disable the process button when idle and text is empty', () => {
      const elements = getUIElements();
      const state: AppState = { ...initialState, audioLifecycle: 'idle', inputLifecycle: 'empty' };
      renderUI(elements, state);

      expect(elements.processTextButton.disabled).toBe(true);
      expect(elements.statusReport.textContent).toBe('Please enter text to be read aloud.');
    });
  });

  describe('Processing State', () => {
    it('should show the correct UI when processing text', () => {
      const elements = getUIElements();
      const state: AppState = { ...initialState, audioLifecycle: 'processing', inputLifecycle: 'hasSubmittedText' };
      renderUI(elements, state);

      expect(elements.processTextButton.disabled).toBe(true);
      expect(elements.haltButton.disabled).toBe(false); // Halt button enabled
      expect(elements.statusReport.textContent).toBe('Processing...');
      expect(elements.audioOutput.style.display).toBe('none');
    });
  });

  describe('Playback States', () => {
    it('should show the audio player when ready to play', () => {
      const elements = getUIElements();
      const state: AppState = { ...initialState, audioLifecycle: 'readyToPlay', inputLifecycle: 'hasSubmittedText' };
      renderUI(elements, state);

      expect(elements.processTextButton.disabled).toBe(true);
      expect(elements.audioOutput.style.display).toBe('block');
      expect(elements.statusReport.textContent).toBe('Please press the play button on the audio player.');
    });

    it('should update the UI correctly when playing', () => {
      const elements = getUIElements();
      const state: AppState = { ...initialState, audioLifecycle: 'playing', inputLifecycle: 'hasSubmittedText' };
      renderUI(elements, state);

      expect(elements.processTextButton.disabled).toBe(true);
      expect(elements.statusReport.textContent).toBe('Playback in progress...');
    });

    it('should enable the process button if paused and new text is entered', () => {
      const elements = getUIElements();
      elements.ronText.value = 'A new thought occurred to me.';
      const state: AppState = { ...initialState, audioLifecycle: 'paused', inputLifecycle: 'hasRawText' };
      renderUI(elements, state);

      expect(elements.processTextButton.disabled).toBe(false); // The key check
      expect(elements.statusReport.textContent).toBe('Playback paused. Ready to process new text.');
    });
  });

  describe('Error State', () => {
    it('should display an error message and disable controls in the error state', () => {
      const elements = getUIElements();
      const errorMessage = 'Something went terribly wrong.';
      const state: AppState = { ...initialState, audioLifecycle: 'error', errorMessage: errorMessage };
      renderUI(elements, state);

      expect(elements.statusReport.textContent).toBe(errorMessage);
      expect(elements.processTextButton.disabled).toBe(true);
      expect(elements.haltButton.disabled).toBe(true);
    });
  });

});
