import { describe, it, expect } from 'vitest';
import { encodeWav } from './wav-encoder';

describe('WAV Encoder', () => {
  const sampleRate = 16000;
  const audioData = new Float32Array([0.1, -0.1, 0.2, -0.2, 0.3]);
  const wavBlob = encodeWav(audioData, sampleRate);

  // Helper to read a Blob as an ArrayBuffer using FileReader
  const readBlobAsArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });
  };

  // Helper function to read a string from a DataView
  const getString = (view: DataView, offset: number, length: number) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += String.fromCharCode(view.getUint8(offset + i));
    }
    return result;
  };

  it('should create a Blob with the correct MIME type', () => {
    expect(wavBlob.type).toBe('audio/wav');
  });

  it('should have the correct header markers (RIFF, WAVE, fmt, data)', async () => {
    const buffer = await readBlobAsArrayBuffer(wavBlob);
    const view = new DataView(buffer);

    expect(getString(view, 0, 4)).toBe('RIFF');
    expect(getString(view, 8, 4)).toBe('WAVE');
    expect(getString(view, 12, 4)).toBe('fmt ');
    expect(getString(view, 36, 4)).toBe('data');
  });

  it('should correctly calculate file and data sizes', async () => {
    const buffer = await readBlobAsArrayBuffer(wavBlob);
    const view = new DataView(buffer);
    const bytesPerSample = 4; // 32-bit float
    const expectedDataSize = audioData.length * bytesPerSample;
    const expectedChunkSize = 36 + expectedDataSize; // 36 is the size of the header before the data chunk

    expect(view.getUint32(4, true)).toBe(expectedChunkSize);
    expect(view.getUint32(40, true)).toBe(expectedDataSize);
    expect(buffer.byteLength).toBe(44 + expectedDataSize);
  });

  it('should write the correct format parameters in the "fmt" chunk', async () => {
    const buffer = await readBlobAsArrayBuffer(wavBlob);
    const view = new DataView(buffer);

    const numChannels = 1;
    const bitDepth = 32;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;

    // Test values at their specific byte offsets
    expect(view.getUint16(20, true)).toBe(3); // 3 for IEEE Float
    expect(view.getUint16(22, true)).toBe(numChannels);
    expect(view.getUint32(24, true)).toBe(sampleRate);
    expect(view.getUint32(28, true)).toBe(byteRate);
    expect(view.getUint16(32, true)).toBe(blockAlign);
    expect(view.getUint16(34, true)).toBe(bitDepth);
  });

  it('should correctly write the Float32 audio data', async () => {
    const buffer = await readBlobAsArrayBuffer(wavBlob);
    const view = new DataView(buffer);

    // Check the first and last samples to ensure data integrity
    const firstSample = view.getFloat32(44, true);
    const lastSample = view.getFloat32(44 + (audioData.length - 1) * 4, true);

    // Use toBeCloseTo for floating point comparisons
    expect(firstSample).toBeCloseTo(audioData[0]);
    expect(lastSample).toBeCloseTo(audioData[audioData.length - 1]);
  });
});
