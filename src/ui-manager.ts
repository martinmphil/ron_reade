// src/ui-manager.ts

import { type AppState } from './state';

/**
 * A collection of all the UI elements the manager needs to interact with.
 * This provides a single, typed object for easy access.
 */
export interface UIElements {
  ronText: HTMLTextAreaElement;
  processTextButton: HTMLButtonElement;
  clearButton: HTMLButtonElement;
  haltButton: HTMLButtonElement;
  audioOutput: HTMLAudioElement;
  statusReport: HTMLParagraphElement;
}

/**
 * Updates the UI elements on the page to reflect the current application state.
 * This function is the single source of truth for rendering the UI.
 *
 * @param elements A collection of the DOM elements to manage.
 * @param state The current application state to render.
 */
export function initializeUIManager(elements: UIElements, state: AppState): void {
  // --- Button State ---
  const { audioLifecycle, inputLifecycle } = state;

  // The 'Process' button is enabled only when the app is idle or paused, AND there is new text.
  elements.processTextButton.disabled = !(
    (audioLifecycle === 'idle' || audioLifecycle === 'paused') &&
    inputLifecycle === 'hasRawText'
  );

  // The 'Halt' button is enabled only when processing is active.
  elements.haltButton.disabled = audioLifecycle !== 'processing';

  // The 'Clear' button is enabled whenever there is text in the textarea.
  elements.clearButton.disabled = elements.ronText.value.trim().length === 0;

  // --- Visibility ---
  // The audio player is only visible when audio is ready to be played or is currently playing/paused.
  const isAudioVisible =
    audioLifecycle === 'readyToPlay' ||
    audioLifecycle === 'playing' ||
    audioLifecycle === 'paused';
  elements.audioOutput.style.display = isAudioVisible ? 'block' : 'none';

  // --- Status Message ---
  // A simple switch to determine the correct status message.
  switch (audioLifecycle) {
    case 'modelLoading':
      elements.statusReport.textContent = 'Downloading artificial neural network...';
      break;
    // Add other cases here as we build them...
  }
}
