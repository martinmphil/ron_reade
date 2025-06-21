import './style.css'
import { initialState } from './state';
import { stateReducer, type Action } from './state-reducer';
import { renderUI, type UIElements } from './ui-manager';
import { loadModel, processTextToAudio } from './tts-service';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<header>
  <p>Text-To-Speech via <a
      href="https://huggingface.co/docs/transformers.js/index">Transformers.js</a></p>
</header>

<main>
  <h1>Ron Reade</h1>
  <p><label for="ron_text">Enter text:</label></p>
  <textarea name="ron_text" id="ron_text" rows="20" cols="33"
    placeholder="Enter text here"></textarea>
  <button id="process_text_button" type="button" disabled>Read Aloud</button>
  <button id="clear_button" type="button" disabled>Clear Text</button>
  <button id="halt_button" type="button" disabled>Halt Processing</button>
  <audio id="audio_output" controls></audio>
  <p id="status_report">Downloading artificial neural network...</p>
</main>

<footer>
  <h2>How it works</h2>
  <p>
    Ron Reade uses advanced machine-learning running right in your browser to convert text
    into natural-sounding speech.
  </p>
  <p>
    Your text stays private on your device.
  </p>
  <p><a href="https://github.com/martinmphil/ron_reade" target="_blank"
      rel="noopener noreferrer">Project on GitHub</a></p>
</footer>
`

// --- Application Store ---
const store = {
  state: initialState,
};

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', main);

/**
 * The main entry point for the application.
 */
function main() {
  const elements: UIElements = {
    ronText: document.getElementById('ron_text') as HTMLTextAreaElement,
    processTextButton: document.getElementById('process_text_button') as HTMLButtonElement,
    clearButton: document.getElementById('clear_button') as HTMLButtonElement,
    haltButton: document.getElementById('halt_button') as HTMLButtonElement,
    audioOutput: document.getElementById('audio_output') as HTMLAudioElement,
    statusReport: document.getElementById('status_report') as HTMLParagraphElement,
  };

  const dispatch = (action: Action) => {
    const newState = stateReducer(store.state, action);
    if (newState !== store.state) {
      store.state = newState;
      renderUI(elements, store.state);
    }
  };

  setupEventListeners(elements, dispatch);
  renderUI(elements, store.state);

  initializeModel(dispatch);
}

/**
 * Attaches all necessary DOM event listeners to the UI elements.
 * @param elements The collection of UI elements.
 * @param dispatch The function to call to dispatch actions.
 */
function setupEventListeners(elements: UIElements, dispatch: (action: Action) => void) {
  elements.ronText.addEventListener('input', () => {
    dispatch({ type: 'USER_INPUT_TEXT' });
  });

  elements.clearButton.addEventListener('click', () => {
    elements.ronText.value = '';
    // Trigger the input event to ensure UI updates correctly
    elements.ronText.dispatchEvent(new Event('input'));
    dispatch({ type: 'USER_CLEARED_TEXT' });
  });

  elements.processTextButton.addEventListener('click', () => {
    const textToProcess = elements.ronText.value;
    dispatch({ type: 'PROCESS_TEXT_SUBMITTED' });

    if (store.state.audioLifecycle === 'processing') {
      runTextProcessing(dispatch, textToProcess);
    }
  });

  elements.haltButton.addEventListener('click', () => {
    // Add cancellation logic here later.
    dispatch({ type: 'USER_HALTED_PROCESSING' });
  });

  elements.audioOutput.addEventListener('pause', () => {
    if (elements.audioOutput.ended) {
      dispatch({ type: 'AUDIO_PLAYBACK_ENDED' });
    } else {
      dispatch({ type: 'USER_PAUSED_AUDIO' });
    }
  });

  elements.audioOutput.addEventListener('play', () => {
    dispatch({ type: 'USER_PLAYED_AUDIO' });
  });
}

/**
 * Manages the process of loading the model with retry logic.
 */
async function initializeModel(dispatch: (action: Action) => void) {
  try {
    await loadModel();
    dispatch({ type: 'MODEL_LOAD_SUCCESS' });
  } catch (error) {
    console.error('Failed to load model:', error);
    dispatch({ type: 'MODEL_LOAD_FAILURE' });
    // Add retry logic here based on the state's retry count.
  }
}

/**
 * Manages the text-to-speech conversion process.
 */
async function runTextProcessing(dispatch: (action: Action) => void, text: string) {
  // Add the text chunking and audio concatenation logic here.
  // For now, we process the whole text as one chunk.
  try {
    const audioData = await processTextToAudio(text);
    // TODO: Create a WAV blob from audioData and set it as the audioOutput.src
    console.log('Generated audio data:', audioData);
    dispatch({ type: 'PROCESSING_SUCCESS' });
  } catch (error) {
    console.error('Failed to process text:', error);
    dispatch({ type: 'PROCESSING_FAILURE', payload: (error as Error).message });
  }
}
