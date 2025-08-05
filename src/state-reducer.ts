import { type AppState } from './state';

const MAX_RETRIES = 7;

// --- Action Definitions ---
// Define all possible actions as a discriminated union type.
// This allows TypeScript to provide strong typing within the reducer.


type ModelLoadSuccessAction = { type: 'MODEL_LOAD_SUCCESS' };
type ModelLoadFailureAction = { type: 'MODEL_LOAD_FAILURE' };
type ProcessingSuccessAction = { type: 'PROCESSING_SUCCESS'; payload: string };
type UserHaltedProcessingAction = { type: 'USER_HALTED_PROCESSING' };
type ProcessingFailureAction = { type: 'PROCESSING_FAILURE'; payload: string };
type UserPlayedAudioAction = { type: 'USER_PLAYED_AUDIO' };
type UserPausedAudioAction = { type: 'USER_PAUSED_AUDIO' };
type AudioPlaybackEndedAction = { type: 'AUDIO_PLAYBACK_ENDED' };
type ProcessTextSubmittedAction = { type: 'PROCESS_TEXT_SUBMITTED', payload: { totalChunks: number } };
type ProcessingChunkSuccessAction = { type: 'PROCESSING_CHUNK_SUCCESS' };
type UserInputTextAction = { type: 'USER_INPUT_TEXT' };
type UserClearedTextAction = { type: 'USER_CLEARED_TEXT' };
type UpdateLoadingDotsAction = { type: 'UPDATE_LOADING_DOTS' };


export type Action =
  | ModelLoadSuccessAction
  | ModelLoadFailureAction
  | ProcessingSuccessAction
  | UserHaltedProcessingAction
  | ProcessingFailureAction
  | UserPlayedAudioAction
  | UserPausedAudioAction
  | AudioPlaybackEndedAction
  | ProcessTextSubmittedAction
  | ProcessingChunkSuccessAction
  | UserInputTextAction
  | UserClearedTextAction
  | UpdateLoadingDotsAction;


/**
 * A pure function that calculates the next application state based on the
 * current state and the action dispatched.
 *
 * @param state The current application state.
 * @param action The action that was dispatched.
 * @returns The new application state.
 */
export function stateReducer(state: AppState, action: Action): AppState {
  switch (action.type) {


    // --- Animation Case ---
    case 'UPDATE_LOADING_DOTS':
      if (state.audioLifecycle === 'modelLoading') {
        return {
          ...state,
          loadingDots: (state.loadingDots >= 6 ? 0 : state.loadingDots + 1),
        };
      }
      return state;


    // --- Input Lifecycle Cases ---
    case 'USER_INPUT_TEXT':
      return {
        ...state,
        audioLifecycle: 'idle',
      };

    case 'USER_CLEARED_TEXT':
      return state;

    // --- Combined Logic Case ---
    case 'PROCESS_TEXT_SUBMITTED':
      if (
        (state.audioLifecycle === 'idle' || state.audioLifecycle === 'paused' || state.audioLifecycle === 'readyToPlay')
      ) {
        return {
          ...state,
          audioLifecycle: 'processing',
          processingRetryCount: 0,
          errorMessage: null,
          processingProgress: 0,
          processingTotal: action.payload.totalChunks,
        };
      }
      return state;

    case 'PROCESSING_CHUNK_SUCCESS':
      // This new action increments the progress counter.
      return {
        ...state,
        processingProgress: state.processingProgress + 1,
      };

    // --- Audio Lifecycle Cases ---
    case 'MODEL_LOAD_SUCCESS':
      return {
        ...state,
        audioLifecycle: 'idle',
        modelLoadRetryCount: 0,
        loadingDots: 0,
      };

    case 'MODEL_LOAD_FAILURE':
      const newModelRetryCount = state.modelLoadRetryCount + 1;
      if (newModelRetryCount >= MAX_RETRIES) {
        return {
          ...state,
          audioLifecycle: 'error',
          errorMessage: 'Failed to load the AI model after several retries. Please reload the page.',
          loadingDots: 0,
        };
      }
      return {
        ...state,
        modelLoadRetryCount: newModelRetryCount,
      };

    case 'PROCESSING_SUCCESS':
      return {
        ...state,
        audioLifecycle: 'readyToPlay',
        processingRetryCount: 0,
        lastProcessedText: action.payload,
      };

    case 'PROCESSING_FAILURE':
      const newProcessingRetryCount = state.processingRetryCount + 1;
      if (newProcessingRetryCount >= MAX_RETRIES) {
        return {
          ...state,
          audioLifecycle: 'error',
          errorMessage: action.payload,
        };
      }
      return {
        ...state,
        // Remain in 'processing' state to retry
        processingRetryCount: newProcessingRetryCount,
        errorMessage: action.payload,
      };

    case 'USER_HALTED_PROCESSING':
      // When processing is halted, the worker is terminated and a new one is created.
      // Reload model in this new worker.
      return {
        ...state,
        audioLifecycle: 'modelLoading',
        modelLoadRetryCount: 0,
        processingRetryCount: 0,
        errorMessage: null,
        processingProgress: 0,
        processingTotal: 0,
        loadingDots: 0,
      };

    case 'USER_PLAYED_AUDIO':
      return {
        ...state,
        audioLifecycle: 'playing',
      };

    case 'USER_PAUSED_AUDIO':
      return {
        ...state,
        audioLifecycle: 'paused',
      };

    case 'AUDIO_PLAYBACK_ENDED':
      return {
        ...state,
        audioLifecycle: 'idle',
      };

    default:
      // For any unhandled action, return the current state without changes.
      // This satisfies the exhaustiveness check to handled all cases.
      return state;
  }
}
