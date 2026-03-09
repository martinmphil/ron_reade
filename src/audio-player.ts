export class AudioPlayer {
    private audioElement: HTMLAudioElement;

    constructor(audioElement: HTMLAudioElement) {
        this.audioElement = audioElement;
    }

    setAudio(audioData: Float32Array, sampleRate: number) {
        const blob = this.encodeWAV(audioData, sampleRate);
        const url = URL.createObjectURL(blob);
        this.audioElement.src = url;
        this.audioElement.hidden = false;
        this.audioElement.classList.remove('semitransparent');
    }

    clearAudio() {
        if (this.audioElement.src) {
            URL.revokeObjectURL(this.audioElement.src);
        }
        this.audioElement.removeAttribute('src');
        this.audioElement.load();
        this.audioElement.hidden = true;
        this.audioElement.classList.add('semitransparent');
    }

    private encodeWAV(samples: Float32Array, sampleRate: number): Blob {
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);

        const writeString = (offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + samples.length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, samples.length * 2, true);

        const floatTo16BitPCM = (output: DataView, offset: number, input: Float32Array) => {
            for (let i = 0; i < input.length; i++) {
                const s = Math.max(-1, Math.min(1, input[i]));
                output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                offset += 2;
            }
        };

        floatTo16BitPCM(view, 44, samples);

        return new Blob([view], { type: 'audio/wav' });
    }
}
