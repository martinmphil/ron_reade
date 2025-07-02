let worker: Worker | null = null;

/**
 * Initializes the voicing service by creating a new web worker.
 */
export function initializeVoicingService(): void {
  if (worker) {
    worker.terminate();
  }
  worker = new Worker(new URL('./voicing.worker.ts', import.meta.url), { type: 'module' });
}

/**
 * Loads the text-to-speech model in the web worker.
 */
export function loadModel(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!worker) {
      return reject('Voicing service not initialized.');
    }

    worker.onmessage = (event) => {
      if (event.data.type === 'modelLoadSuccess') {
        resolve();
      } else if (event.data.type === 'processingFailure') {
        reject(event.data.payload);
      }
    };

    worker.postMessage({ type: 'loadModel' });
  });
}

/**
 * Generates an audio waveform from a given text string using the web worker.
 * @param text The text to convert to speech.
 * @returns A Float32Array containing the audio waveform data.
 */
export function processTextToAudio(text: string): Promise<Float32Array> {
  return new Promise((resolve, reject) => {
    if (!worker) {
      return reject('Voicing service not initialized.');
    }

    worker.onmessage = (event) => {
      if (event.data.type === 'processingSuccess') {
        resolve(event.data.payload);
      } else if (event.data.type === 'processingFailure') {
        reject(event.data.payload);
      }
    };

    worker.postMessage({ type: 'processText', payload: text });
  });
}
