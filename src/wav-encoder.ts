/**
 * Encodes a Float32Array of audio data into a WAV file format Blob.
 *
 * @param audioData The raw audio data (Float32Array).
 * @param sampleRate The sample rate of the audio (e.g., 16000).
 * @returns A Blob representing the WAV file.
 */
export function encodeWav(audioData: Float32Array, sampleRate: number): Blob {
  // const format = 1; // PCM
  const format = 3; // IEEE float data
  const numChannels = 1;
  const bitDepth = 32; // Float32

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = audioData.length * bytesPerSample;
  const chunkSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, chunkSize, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Sub-chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write the audio data
  for (let i = 0; i < audioData.length; i++) {
    view.setFloat32(44 + i * 4, audioData[i], true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
