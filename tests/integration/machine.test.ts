import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createActor } from 'xstate';
import { machine } from '../../src/machine';
// Mock ModelManager before importing machine? 
// Machine imports ModelManager directly. We need to mock the module.
import { ModelManager } from '../../src/model-manager';

// Mock dependencies
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

describe('Ron Reade Machine', () => {
    let mockMmInstance: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockMmInstance = ModelManager.getInstance();

        // Default happy path mocks
        mockMmInstance.loadModel.mockImplementation(async (cb: any) => {
            // Simulate success immediately
            return Promise.resolve();
        });

        mockMmInstance.synthesize.mockImplementation(async (chunk: string) => {
            return {
                audio: new Float32Array([0, 1, 0]),
                sampling_rate: 16000
            };
        });
    });

    it('should start in Model_Acquisition and transition to Model_Primed on success', async () => {
        const actor = createActor(machine);
        actor.start();

        expect(actor.getSnapshot().matches({ Model_Manager: 'Model_Acquisition' })).toBe(true);

        // Wait for promise to resolve (microtasks)
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(actor.getSnapshot().matches({ Model_Manager: 'Model_Primed' })).toBe(true);
    });

    it('should transition to Model_Acquisition_Retry on load failure', async () => {
        // Mock failure
        mockMmInstance.loadModel.mockRejectedValue(new Error('Load failed'));

        const actor = createActor(machine);
        actor.start();

        // Wait for promise rejection handling
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(actor.getSnapshot().matches({ Model_Manager: 'Model_Acquisition_Retry' })).toBe(true);
        expect(actor.getSnapshot().context.retryCount).toBe(1);
    });

    it('should process text and accumulate audio', async () => {
        const actor = createActor(machine);
        actor.start();

        // Wait for load
        await new Promise(resolve => setTimeout(resolve, 0));

        // Enter text
        actor.send({ type: 'TEXT_UPDATED', text: 'Hello world.' });

        // Check text validation state
        expect(actor.getSnapshot().matches({ Text_Validation: 'Text_Valid' })).toBe(true);

        // Process
        actor.send({ type: 'PROCESS_TEXT' });

        // Should be Converting
        expect(actor.getSnapshot().matches({ Model_Manager: { Model_Primed: { Input: 'Converting' } } })).toBe(true);

        // Wait for synthesis (async)
        await new Promise(resolve => setTimeout(resolve, 10)); // Give it a bit more time for inner invoke

        // Should eventually go back to Awaiting_Conversion
        // Depending on timing of the test run, might need polling or just check final state
        // For unit test with mocked immediate resolve, it should be fast.

        // Check that accumulatedAudio has data
        // actor.send({ type: 'CONVERSION_SUCCESS' }); // Is raised internally

        // Since it's a parallel state machine, let's just check context eventually
        await new Promise(resolve => setTimeout(resolve, 20));

        expect(actor.getSnapshot().context.accumulatedAudio.length).toBeGreaterThan(0);
        // We mocked synthesis to return [0, 1, 0]
        expect(actor.getSnapshot().context.accumulatedAudio[0]).toEqual(new Float32Array([0, 1, 0]));
    });

    it('should halt processing', async () => {
        // Mock slow synthesis
        mockMmInstance.synthesize.mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            return { audio: new Float32Array([]), sampling_rate: 16000 };
        });

        const actor = createActor(machine);
        actor.start();
        await new Promise(resolve => setTimeout(resolve, 0)); // Load

        actor.send({ type: 'TEXT_UPDATED', text: 'Hello world.' });
        actor.send({ type: 'PROCESS_TEXT' });

        expect(actor.getSnapshot().matches({ Model_Manager: { Model_Primed: { Input: 'Converting' } } })).toBe(true);

        actor.send({ type: 'HALT_PROCESSING' });

        expect(actor.getSnapshot().matches({ Model_Manager: { Model_Primed: { Input: 'Awaiting_Conversion' } } })).toBe(true);
        expect(actor.getSnapshot().context.accumulatedAudio).toEqual([]);
    });
});
