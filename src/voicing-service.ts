import { pipeline, env } from '@huggingface/transformers';

// A reference to the loaded synthesizer pipeline.
let synthesizer: any = null;

/**
 * Initializes the Transformers.js environment and loads the required
 * text-to-speech model.
 */
export async function loadModel(): Promise<void> {
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
 * @param abortSignal The AbortSignal to allow for cancellation.
 * @returns A Float32Array containing the audio waveform data.
 */
export async function processTextToAudio(
  text: string,
  abortSignal?: AbortSignal
): Promise<Float32Array> {
  if (!synthesizer) {
    throw new Error('Text-to-speech model is not loaded yet.');
  }

  // Relative path to the speaker embeddings file
  const speakerEmbeddingsUrl = './speaker_embeddings.bin';

  const output = await synthesizer(text, {
    speaker_embeddings: speakerEmbeddingsUrl,
    signal: abortSignal,
  });

  return output.audio;
}
