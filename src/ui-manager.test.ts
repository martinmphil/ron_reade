// src/ui-manager.test.ts

import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { initializeUIManager } from './ui-manager';
import { initialState } from './state';

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

describe('UI Manager', () => {

  // A helper function to get all the UI elements from the DOM
  const getUIElements = () => ({
    ronText: document.getElementById('ron_text') as HTMLTextAreaElement,
    processTextButton: document.getElementById('process_text_button') as HTMLButtonElement,
    clearButton: document.getElementById('clear_button') as HTMLButtonElement,
    haltButton: document.getElementById('halt_button') as HTMLButtonElement,
    audioOutput: document.getElementById('audio_output') as HTMLAudioElement,
    statusReport: document.getElementById('status_report') as HTMLParagraphElement,
  });

  it('should initialize the UI correctly based on the initial state', () => {
    // We don't need a real store or dispatcher for this test,
    // we just need to see if the UI renders the state correctly.
    const elements = getUIElements();

    // The initializeUIManager function will contain the rendering logic.
    // We pass it the elements and the state we want it to render.
    initializeUIManager(elements, initialState);

    // Assertions based on the `initialState`
    expect(elements.statusReport.textContent).toBe('Downloading artificial neural network...');
    expect(elements.processTextButton.disabled).toBe(true);
    expect(elements.haltButton.disabled).toBe(true);
    expect(elements.audioOutput.style.display).toBe('none');
    expect(elements.clearButton.disabled).toBe(true);
  });

  // We will add more tests here later, for example:
  // it('should disable the process button when audio is playing', () => { ... });
  // it('should show the correct status message when processing', () => { ... });

});
