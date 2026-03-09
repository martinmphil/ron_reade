import { pipeline, env } from '@xenova/transformers';

// Skip local model checks since we are in a browser
env.allowLocalModels = false;
env.useBrowserCache = true;

let synthesizer: any = null;
let speakerEmbeddings: Float32Array | null = null;

self.onmessage = async (event: MessageEvent) => {
    const { type, payload, id } = event.data;

    try {
        if (type === 'LOAD_MODEL') {
            if (!speakerEmbeddings) {
                const response = await fetch('../speaker_embeddings.bin');
                if (!response.ok) throw new Error(`Failed to load speaker embeddings: ${response.statusText}`);
                const buffer = await response.arrayBuffer();
                speakerEmbeddings = new Float32Array(buffer);
            }

            if (!synthesizer) {
                synthesizer = await pipeline('text-to-speech', 'Xenova/speecht5_tts', {
                    quantized: false,
                });
            }

            self.postMessage({ type: 'MODEL_LOADED', id });
        } else if (type === 'SYNTHESIZE') {
            if (!synthesizer || !speakerEmbeddings) {
                throw new Error('Model not loaded');
            }

            const result = await synthesizer(payload.text, {
                speaker_embeddings: speakerEmbeddings,
            });

            self.postMessage({
                type: 'SYNTHESIS_COMPLETE',
                id,
                payload: { audio: result.audio, sampling_rate: result.sampling_rate }
            });
        }
    } catch (error: any) {
        self.postMessage({ type: 'ERROR', id, error: error.message || error.toString() });
    }
};
