import './style.css'
import { initialState } from './state';
import { stateReducer, type Action } from './state-reducer';
import { renderUI, type UIElements } from './ui-manager';
import { loadModel, processTextToAudio } from './tts-service';
import { chunkText } from './modules/text-processing';
import { encodeWav } from './wav-encoder';

// A constant for the audio sample rate, as defined by the TTS model.
const SAMPLE_RATE = 16000;

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
  <div class="button-group">
    <button id="process_text_button" type="button" disabled>Read Aloud</button>
    <button id="clear_button" type="button" disabled>Clear Text</button>
    <button id="halt_button" type="button" disabled>Halt Processing</button>
  </div>
  <audio id="audio_output" controls
    style="opacity: 0.4; transition: opacity 0.3s ease-in-out;">
  </audio>
  <p id="status_report">Downloading artificial neural network...</p>
  <progress id="progress_bar" max="100" value="0"
    style="opacity: 0; transition: opacity 0.3s ease-in-out; width: 100%;">
  </progress>
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
  // A flag to signal the processing loop to stop.
  haltSignal: false,
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
    progressBar: document.getElementById('progress_bar') as HTMLProgressElement,
    statusReport: document.getElementById('status_report') as HTMLParagraphElement,
  };

  // dispatch function is later passed to event listeners and render-UI fn
  const dispatch = (action: Action) => {
    const newState = stateReducer(store.state, action);
    if (newState !== store.state) {
      store.state = newState;
      renderUI(elements, store.state);
    }
  };

  setupEventListeners(elements, dispatch);

  // First render occurs with the initial state
  renderUI(elements, store.state);

  initializeModel(dispatch);
}

/**
 * Note setupEventListeners function depends on runTextProcessing function 
 * and hence they must share the same scope. 
 */

/**
 * Attach all necessary DOM event listeners to the UI elements.
 */
function setupEventListeners(elements: UIElements, dispatch: (action: Action) => void) {
  elements.ronText.addEventListener('input', () => {
    dispatch({ type: 'USER_INPUT_TEXT' });
  });

  elements.clearButton.addEventListener('click', () => {
    elements.ronText.value = '';
    elements.ronText.dispatchEvent(new Event('input'));
    dispatch({ type: 'USER_CLEARED_TEXT' });
  });

  elements.processTextButton.addEventListener('click', () => {
    runTextProcessing(dispatch, elements, elements.ronText.value);
  });

  elements.haltButton.addEventListener('click', () => {
    // Signal the processing loop to stop.
    store.haltSignal = true;
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

    // Check state for retry logic
    if (store.state.audioLifecycle === 'modelLoading') {
      setTimeout(() => initializeModel(dispatch), 2000 * store.state.modelLoadRetryCount);
    }
  }
}

/**
 * Manages the full text-to-speech conversion pipeline.
 */
async function runTextProcessing(
  dispatch: (action: Action) => void,
  elements: UIElements,
  text: string
) {

  if (
    (store.state.audioLifecycle !== 'idle' && store.state.audioLifecycle !== 'paused') ||
    store.state.inputLifecycle !== 'hasRawText'
  ) {
    return;
  }

  // Reset the halt signal for the new job.
  store.haltSignal = false;

  let combinedAudio = new Float32Array(0);

  // Chunk the text first to get the total count.
  const textChunks = chunkText(text);
  if (textChunks.length === 0) return;

  // Dispatch the starting action with the total number of chunks.
  dispatch({
    type: 'PROCESS_TEXT_SUBMITTED',
    payload: { totalChunks: textChunks.length },
  });

  try {
    // Iterate through each chunk.
    for (const chunk of textChunks) {

      if (store.haltSignal) {
        console.log('Processing halted by user.');
        return;
      }

      // Process the chunk to get audio data.
      const audioChunk = await processTextToAudio(chunk);

      // Dispatch progress update after a chunk is successfully processed.
      dispatch({ type: 'PROCESSING_CHUNK_SUCCESS' });

      // Concatenate the new audio data.
      const newCombined = new Float32Array(combinedAudio.length + audioChunk.length);
      newCombined.set(combinedAudio, 0);
      newCombined.set(audioChunk, combinedAudio.length);
      combinedAudio = newCombined;
    }

    // Encode the final buffer to a WAV Blob.
    const wavBlob = encodeWav(combinedAudio, SAMPLE_RATE);

    // Create an object URL and update the audio player.
    const audioUrl = URL.createObjectURL(wavBlob);
    elements.audioOutput.src = audioUrl;

    // Signal successful processing
    dispatch({ type: 'PROCESSING_SUCCESS' });

  } catch (error) {
    console.error('Failed to process text:', error);
    dispatch({ type: 'PROCESSING_FAILURE', payload: (error as Error).message });

    // Retry logic
    if (store.state.audioLifecycle as 'processing' | 'idle' | 'paused' === 'processing') {
      setTimeout(() => runTextProcessing(dispatch, elements, text), 2000 * store.state.processingRetryCount);
    }

  }
}
