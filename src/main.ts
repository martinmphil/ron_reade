import './style.css'
import { initialView } from './initial-view';
import { initialState } from './state';
import { stateReducer, type Action } from './state-reducer';
import { renderUI, type UIElements } from './ui-manager';
import { initializeVoicingService, loadModel, processTextToAudio } from './voicing-service';
import { chunkText } from './chunk-text';
import { encodeWav } from './wav-encoder';

// A constant for the audio sample rate, as defined by the text-to-speech model.
const SAMPLE_RATE = 16000;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = initialView;

// --- Application Store ---
const store = {
  state: initialState,
};

// --- Initialise App ---
document.addEventListener('DOMContentLoaded', main);
window.addEventListener('pageshow', (event) => {
  // Re-initialize the app if the page is loaded from the back-forward cache
  if (event.persisted) {
    main();
  }
});

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
    dispatch({ type: 'USER_CLEARED_TEXT' });
  });

  elements.processTextButton.addEventListener('click', () => {
    runTextProcessing(dispatch, elements, elements.ronText.value);
  });

  elements.haltButton.addEventListener('click', () => {
    // Terminate the current worker and create a new one.
    initializeVoicingService();
    // Dispatch an action to put the app into the model loading state.
    dispatch({ type: 'USER_HALTED_PROCESSING' });
    // Reload the model in the new worker.
    initializeModel(dispatch);
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
  const loadingAnimation = setInterval(() => {
    dispatch({ type: 'UPDATE_LOADING_DOTS' });
  }, 1000);

  initializeVoicingService();
  try {
    await loadModel();
    clearInterval(loadingAnimation);
    dispatch({ type: 'MODEL_LOAD_SUCCESS' });
  } catch (error) {
    console.error('Failed to load model:', error);
    dispatch({ type: 'MODEL_LOAD_FAILURE' });

    // Check state for retry logic
    if (store.state.audioLifecycle === 'modelLoading') {
      setTimeout(() => initializeModel(dispatch), 2000 * store.state.modelLoadRetryCount);
    } else {
      clearInterval(loadingAnimation);
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
    (store.state.audioLifecycle !== 'idle' &&
      store.state.audioLifecycle !== 'paused' &&
      store.state.audioLifecycle !== 'readyToPlay')
  ) {
    return;
  }

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
    for (const chunk of textChunks) {

      // Process the chunk to get audio data.
      const audioChunk = await processTextToAudio(chunk);

      // Dispatch progress update after a chunk is successfully processed.
      dispatch({ type: 'PROCESSING_CHUNK_SUCCESS' });

      // Concatenate the new audio data.
      const newCombinedAudio = new Float32Array(combinedAudio.length + audioChunk.length);
      newCombinedAudio.set(combinedAudio, 0);
      newCombinedAudio.set(audioChunk, combinedAudio.length);
      combinedAudio = newCombinedAudio;
    }

    // Encode the final buffer to a WAV Blob.
    const wavBlob = encodeWav(combinedAudio, SAMPLE_RATE);

    // Create an object URL and update the audio player.
    const audioUrl = URL.createObjectURL(wavBlob);
    elements.audioOutput.src = audioUrl;

    // Signal successful processing
    dispatch({ type: 'PROCESSING_SUCCESS', payload: text });

  } catch (error) {
    console.error('Failed to process text:', error);
    dispatch({ type: 'PROCESSING_FAILURE', payload: (error as Error).message });

    // Retry logic
    if (store.state.audioLifecycle as 'processing' | 'idle' | 'paused' === 'processing') {
      setTimeout(() => runTextProcessing(dispatch, elements, text), 2000 * store.state.processingRetryCount);
    }
  }

}
