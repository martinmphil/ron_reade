// src/tts-service.ts

// Import the necessary functions directly from the Transformers.js ES module.
// The path '/transformers.min.js' is correct because the file is in the `public` directory.
import { pipeline, env } from './huggingface/transformers';

// A reference to the loaded synthesizer pipeline.
let synthesizer: any = null;

/**
 * Initializes the Transformers.js environment and loads the local
 * text-to-speech model.
 */
export async function loadModel(): Promise<void> {
  // Configure the environment to use local models only.
  env.allowLocalModels = true;
  env.allowRemoteModels = false;

  // Set the root for where the models are located.
  // This path is relative to the `public` directory root.
  env.localModelPath = '/models/';

  // Load the text-to-speech pipeline.
  synthesizer = await pipeline('text-to-speech', 'Xenova/speecht5_tts', {
    quantized: false, // Use false for higher quality, true for smaller/faster.
  });
}

/**
 * Generates an audio waveform from a given text string using the loaded model.
 *
 * @param text The text to convert to speech.
 * @returns A Float32Array containing the audio waveform data.
 */
export async function processTextToAudio(text: string): Promise<Float32Array> {
  if (!synthesizer) {
    throw new Error('TTS model is not loaded yet.');
  }

  // The path to the speaker embeddings file, relative to the `public` directory.
  const speakerEmbeddingsUrl = '/speaker_embeddings.bin';

  const output = await synthesizer(text, {
    speaker_embeddings: speakerEmbeddingsUrl,
  });

  return output.audio;
}
