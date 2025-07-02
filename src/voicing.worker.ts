import { pipeline, env } from '@huggingface/transformers';

// A reference to the loaded synthesizer pipeline.
let synthesizer: any = null;

/**
 * Initializes the Transformers.js environment and loads the required
 * text-to-speech model.
 */
async function loadModel(): Promise<void> {
  // Configure the environment to use CDN models only.
  env.allowLocalModels = false;
  env.allowRemoteModels = true;
  env.useBrowserCache = true;

  // Load the text-to-speech pipeline.
  synthesizer = await pipeline('text-to-speech', 'Xenova/speecht5_tts',
    { dtype: 'fp32' }
  );
}

/**
 * Generates an audio waveform from a given text string using the loaded model.
 * @param text The text to convert to speech.
 * @returns A Float32Array containing the audio waveform data.
 */
async function processTextToAudio(
  text: string,
): Promise<Float32Array> {
  if (!synthesizer) {
    throw new Error('Text-to-speech model is not loaded yet.');
  }

  // Path to the speaker embeddings file in /public directory 
  const speakerEmbeddingsUrl = '/speaker_embeddings.bin';

  const output = await synthesizer(text, {
    speaker_embeddings: speakerEmbeddingsUrl,
  });

  return output.audio;
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  const { type, payload } = event.data;

  try {
    if (type === 'loadModel') {
      await loadModel();
      self.postMessage({ type: 'modelLoadSuccess' });
    } else if (type === 'processText') {
      const audio = await processTextToAudio(payload);
      self.postMessage({ type: 'processingSuccess', payload: audio });
    }
  } catch (error) {
    self.postMessage({ type: 'processingFailure', payload: (error as Error).message });
  }
});
