import { describe, it, expect } from 'vitest';
import { initialState, type AppState } from './state';
import { stateReducer, type Action } from './state-reducer';

describe('Application State Machine Reducer', () => {

  describe('Initial State', () => {
    it('should have the correct initial state when the app loads', () => {
      const expectedInitialState: AppState = {
        audioLifecycle: 'modelLoading',
        
        modelLoadRetryCount: 0,
        processingRetryCount: 0,
        errorMessage: null,
        processingProgress: 0,
        processingTotal: 0,
        lastProcessedText: null
      };
      expect(initialState).toEqual(expectedInitialState);
    });

    it('should return the initial state for an unknown action', () => {
      // @ts-expect-error - Testing with an invalid action type
      const unknownAction: Action = { type: 'UNKNOWN_ACTION' };
      expect(stateReducer(initialState, unknownAction)).toEqual(initialState);
    });
  });

  

  describe('Audio Lifecycle Transitions', () => {
    describe('Model Loading', () => {
      it('should transition from "modelLoading" to "idle" on success', () => {
        const action: Action = { type: 'MODEL_LOAD_SUCCESS', };
        const newState = stateReducer(initialState, action);
        expect(newState.audioLifecycle).toBe('idle');
      });

      it('should increment modelLoadRetryCount on failure and stay "modelLoading"', () => {
        const action: Action = { type: 'MODEL_LOAD_FAILURE' };
        const newState = stateReducer(initialState, action);
        expect(newState.audioLifecycle).toBe('modelLoading');
        expect(newState.modelLoadRetryCount).toBe(1);
      });

      it('should transition to "error" if max model load retries are reached', () => {
        const state: AppState = { ...initialState, modelLoadRetryCount: 6 };
        const action: Action = { type: 'MODEL_LOAD_FAILURE' };
        const newState = stateReducer(state, action);
        expect(newState.audioLifecycle).toBe('error');
        expect(newState.errorMessage).not.toBeNull();
      });
    });

    describe('Processing', () => {
      const readyState: AppState = { ...initialState, audioLifecycle: 'idle' };
      const processingState: AppState = { ...initialState, audioLifecycle: 'processing' };

      it('should transition from "idle" to "processing" when text is submitted', () => {
        const action: Action = { type: 'PROCESS_TEXT_SUBMITTED', payload: { totalChunks: 1 } };
        const newState = stateReducer(readyState, action);
        expect(newState.audioLifecycle).toBe('processing');
      });

      it('should transition from "processing" to "readyToPlay" on success and reset processingRetryCount', () => {
        const state: AppState = { ...processingState, processingRetryCount: 2 };
        const action: Action = { type: 'PROCESSING_SUCCESS', payload: 'some text' };
        const newState = stateReducer(state, action);
        expect(newState.audioLifecycle).toBe('readyToPlay');
        expect(newState.processingRetryCount).toBe(0);
      });

      it('should return to "idle" and "hasRawText" when user halts processing', () => {
        const action: Action = { type: 'USER_HALTED_PROCESSING' };
        const newState = stateReducer(processingState, action);
        expect(newState.audioLifecycle).toBe('modelLoading');
      });

      it('should stay "processing" and increment processingRetryCount on failure', () => {
        const action: Action = { type: 'PROCESSING_FAILURE', payload: 'TTS chunk failed' };
        const newState = stateReducer(processingState, action);
        expect(newState.audioLifecycle).toBe('processing');
        expect(newState.processingRetryCount).toBe(1);
        expect(newState.errorMessage).toBe('TTS chunk failed');
      });

      it('should transition to "error" if max processing retries are reached', () => {
        const state: AppState = { ...processingState, processingRetryCount: 6 };
        const action: Action = { type: 'PROCESSING_FAILURE', payload: 'TTS failed again' };
        const newState = stateReducer(state, action);
        expect(newState.audioLifecycle).toBe('error');
        expect(newState.errorMessage).toBe('TTS failed again');
      });
    });

    describe('Playback', () => {
      const readyState: AppState = { ...initialState, audioLifecycle: 'readyToPlay' };
      const playingState: AppState = { ...initialState, audioLifecycle: 'playing' };
      const pausedState: AppState = { ...initialState, audioLifecycle: 'paused' };

      it('should transition from "readyToPlay" to "playing"', () => {
        const action: Action = { type: 'USER_PLAYED_AUDIO' };
        const newState = stateReducer(readyState, action);
        expect(newState.audioLifecycle).toBe('playing');

      });

      it('should transition from "playing" to "paused"', () => {
        const action: Action = { type: 'USER_PAUSED_AUDIO' };
        const newState = stateReducer(playingState, action);
        expect(newState.audioLifecycle).toBe('paused');
      });

      it('should transition from "paused" to "playing"', () => {
        const action: Action = { type: 'USER_PLAYED_AUDIO' };
        const newState = stateReducer(pausedState, action);
        expect(newState.audioLifecycle).toBe('playing');
      });

      it('should transition from "playing" to "idle" when playback finishes', () => {
        const action: Action = { type: 'AUDIO_PLAYBACK_ENDED' };
        const newState = stateReducer(playingState, action);
        expect(newState.audioLifecycle).toBe('idle');
      });
    });
  });

  describe('Combined State Logic', () => {
    it('should NOT process text if audioLifecycle is not "idle" or "paused"', () => {
      const state: AppState = { ...initialState, audioLifecycle: 'playing' };
      const action: Action = { type: 'PROCESS_TEXT_SUBMITTED', payload: { totalChunks: 1 } };
      const newState = stateReducer(state, action);
      expect(newState.audioLifecycle).toBe('playing');
    });

    it('should allow processing from "paused" state', () => {
      const state: AppState = { ...initialState, audioLifecycle: 'paused' };
      const action: Action = { type: 'PROCESS_TEXT_SUBMITTED', payload: { totalChunks: 1 } };
      const newState = stateReducer(state, action);
      expect(newState.audioLifecycle).toBe('processing');
    });
  });
});
