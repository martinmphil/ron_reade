import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createActor } from 'xstate';
import { machine } from '../../src/machine';
import { ModelManager } from '../../src/model-manager';

vi.mock('../../src/model-manager', () => {
    const mockSynthesize = vi.fn();
    const mockLoadModel = vi.fn();

    return {
        ModelManager: {
            getInstance: vi.fn(() => ({
                loadModel: mockLoadModel,
                synthesize: mockSynthesize,
                isModelLoaded: false
            }))
        }
    };
});

describe('Multi-chunk Processing', () => {
    let mockMmInstance: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockMmInstance = ModelManager.getInstance();
        mockMmInstance.loadModel.mockResolvedValue(undefined);
        mockMmInstance.synthesize.mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            return { audio: new Float32Array([0.1]), sampling_rate: 16000 };
        });
    });

    it('should progress through all 3 chunks', async () => {
        const actor = createActor(machine);
        actor.start();

        // Wait for model load
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(actor.getSnapshot().matches({ Model_Manager: 'Model_Primed' })).toBe(true);

        // Input 3 sentences
        actor.send({ type: 'TEXT_UPDATED', text: 'One. Two. Three.' });
        actor.send({ type: 'PROCESS_TEXT' });

        // Check it starts at chunk 0
        expect(actor.getSnapshot().context.processingChunkIndex).toBe(0);
        expect(actor.getSnapshot().context.totalChunks).toBe(3);
        expect(actor.getSnapshot().matches({ Model_Manager: { Model_Primed: { Input: 'Converting' } } })).toBe(true);

        // Wait for first chunk completion (100ms synthesis)
        await new Promise(resolve => setTimeout(resolve, 150));
        // It should have incremented to 1 and still be Converting
        expect(actor.getSnapshot().context.processingChunkIndex).toBe(1);
        expect(actor.getSnapshot().matches({ Model_Manager: { Model_Primed: { Input: 'Converting' } } })).toBe(true);

        // Wait for second chunk completion
        await new Promise(resolve => setTimeout(resolve, 150));
        // It should have incremented to 2 and still be Converting
        expect(actor.getSnapshot().context.processingChunkIndex).toBe(2);
        expect(actor.getSnapshot().matches({ Model_Manager: { Model_Primed: { Input: 'Converting' } } })).toBe(true);

        // Wait for third chunk completion
        await new Promise(resolve => setTimeout(resolve, 150));
        // It should have finished and moved to Awaiting_Conversion and Speech_Ready
        expect(actor.getSnapshot().matches({ Model_Manager: { Model_Primed: { Input: 'Awaiting_Conversion' } } })).toBe(true);
        expect(actor.getSnapshot().matches({ Model_Manager: { Model_Primed: { Output: 'Speech_Ready' } } })).toBe(true);
        expect(actor.getSnapshot().context.accumulatedAudio.length).toBe(3);
    });
});
