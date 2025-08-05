import { type AppState } from './state';

/**
 * A collection of all the UI elements the manager needs to interact with.
 * This provides a single, typed object.
 */
export interface UIElements {
  ronText: HTMLTextAreaElement;
  processTextButton: HTMLButtonElement;
  clearButton: HTMLButtonElement;
  haltButton: HTMLButtonElement;
  audioOutput: HTMLAudioElement;
  progressBar: HTMLProgressElement;
  statusReport: HTMLParagraphElement;
}

/**
 * Returns a string of dots for the loading animation.
 * @param count The number of dots to render.
 * @returns A string of dots.
 */
function renderLoadingDots(count: number): string {
  return '.'.repeat(count);
}

/**
 * Updates the UI elements on the page to reflect the current application state.
 * This function is the single source of truth for rendering the UI.
 *
 * @param elements A collection of the DOM elements to manage.
 * @param state The current application state to render.
 */
export function renderUI(elements: UIElements, state: AppState): void {
  const { audioLifecycle, errorMessage, processingProgress, processingTotal, lastProcessedText } = state;

  // --- Button State ---

  // The 'Process' button is enabled only when there is text and the app is not in a critical state.
  const currentText = elements.ronText.value.trim();
  const hasText = currentText.length > 0;
  const textHasChanged = currentText !== lastProcessedText;

  const isProcessButtonEnabled = (
    hasText &&
    textHasChanged &&
    (audioLifecycle === 'idle' || audioLifecycle === 'paused' || audioLifecycle === 'readyToPlay')
  );
  elements.processTextButton.disabled = !isProcessButtonEnabled;

  // The 'Halt' button is enabled only when processing is active.
  elements.haltButton.disabled = audioLifecycle !== 'processing';

  // The 'Clear' button is enabled whenever there is text in the textarea.
  elements.clearButton.disabled = elements.ronText.value.trim().length === 0;

  // --- Audio Player ---

  // The audio player is only opaque when audio is ready to be played or is currently playing/paused.
  const isAudioOpaque =
    audioLifecycle === 'readyToPlay' ||
    audioLifecycle === 'playing' ||
    audioLifecycle === 'paused';
  elements.audioOutput.style.opacity = isAudioOpaque ? '1' : '0.4';

  // --- Progress Bar ---
  const isProcessing = audioLifecycle === 'processing';
  elements.progressBar.style.opacity = isProcessing ? '1' : '0';
  if (isProcessing) {
    elements.progressBar.max = processingTotal + 1;
    elements.progressBar.value = processingProgress + 1;
  }

  // --- Status Message ---

  // A switch statement to determine the correct status message based on the app state.
  if (audioLifecycle !== 'modelLoading') {
    elements.statusReport.classList.remove('loading');
  }

  switch (audioLifecycle) {
    case 'modelLoading':
      elements.statusReport.textContent = 'Downloading artificial neural network';
      elements.statusReport.classList.add('loading');
      elements.statusReport.style.setProperty('--loading-dots', `"${renderLoadingDots(state.loadingDots)}"`);
      break;
    case 'idle':
      elements.statusReport.textContent =
        elements.ronText.value.trim().length > 0
          ? 'Ready to convert your text into speech.'
          : 'Please enter text to be read aloud.';
      break;
    case 'processing':
      elements.statusReport.textContent = `Processing chunk ${processingProgress + 1} of ${processingTotal}...`;
      break;
    case 'readyToPlay':
      elements.statusReport.textContent = 'Please press the play button on the audio player.';
      break;
    case 'playing':
      elements.statusReport.textContent = 'Playback in progress...';
      break;
    case 'paused':
      elements.statusReport.textContent =
        elements.ronText.value.trim().length > 0
          ? 'Playback paused. Ready to process new text.'
          : 'Playback paused.';
      // Default message if no new text
      break;
    case 'error':
      elements.statusReport.textContent = errorMessage || 'An unknown error occurred.';
      break;
    default:
      // This should not be reachable if all states are handled.
      elements.statusReport.textContent = '';
  }
}
