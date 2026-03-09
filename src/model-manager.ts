import { env } from '@xenova/transformers';

// Skip local model checks since we are in a browser
env.allowLocalModels = false;
env.useBrowserCache = true;

export class ModelManager {
    static instance: ModelManager;

    private worker: Worker | null = null;
    private isModelLoaded = false;
    private messageIdCounter = 0;
    private pendingPromises = new Map<number, { resolve: (val: any) => void; reject: (err: any) => void }>();

    private constructor() {
        this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
        this.worker.onmessage = (event) => {
            const { type, id, payload, error } = event.data;
            const promiseHandlers = this.pendingPromises.get(id);
            if (promiseHandlers) {
                if (type === 'ERROR') {
                    promiseHandlers.reject(new Error(error));
                } else {
                    promiseHandlers.resolve(payload);
                }
                this.pendingPromises.delete(id);
            }
        };
        this.worker.onerror = (error) => {
            console.error('Worker error:', error);
        };
    }

    static getInstance(): ModelManager {
        if (!ModelManager.instance) {
            ModelManager.instance = new ModelManager();
        }
        return ModelManager.instance;
    }

    private sendMessage(type: string, payload?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.worker) return reject(new Error('Worker not initialized'));
            const id = this.messageIdCounter++;
            this.pendingPromises.set(id, { resolve, reject });
            this.worker.postMessage({ type, id, payload });
        });
    }

    /**
     * Single shot attempt to load model resources via Web Worker.
     */
    async loadModel(): Promise<void> {
        if (this.isModelLoaded) {
            console.log('ModelManager: already loaded');
            return;
        }

        console.log('ModelManager: sending LOAD_MODEL to worker...');
        try {
            await this.sendMessage('LOAD_MODEL');
            this.isModelLoaded = true;
            console.log('ModelManager: worker load complete.');
        } catch (error) {
            console.error('ModelManager error during load:', error);
            throw error; // Propagate to XState to handle retry transition
        }
    }

    async synthesize(text: string): Promise<{ audio: Float32Array; sampling_rate: number }> {
        if (!this.isModelLoaded) {
            throw new Error('Model not loaded');
        }

        const result = await this.sendMessage('SYNTHESIZE', { text });
        return {
            audio: result.audio,
            sampling_rate: result.sampling_rate,
        };
    }
}
