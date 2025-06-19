import { type AppState } from './state';

const MAX_RETRIES = 7;

// --- Action Definitions ---
// Define all possible actions as a discriminated union type.
// This allows TypeScript to provide strong typing within the reducer.

type UserInputAction = { type: 'USER_INPUT_TEXT' };
type UserClearedTextAction = { type: 'USER_CLEARED_TEXT' };
type ProcessTextSubmittedAction = { type: 'PROCESS_TEXT_SUBMITTED' };
type ModelLoadSuccessAction = { type: 'MODEL_LOAD_SUCCESS' };
type ModelLoadFailureAction = { type: 'MODEL_LOAD_FAILURE' };
type ProcessingSuccessAction = { type: 'PROCESSING_SUCCESS' };
type UserHaltedProcessingAction = { type: 'USER_HALTED_PROCESSING' };
type ProcessingFailureAction = { type: 'PROCESSING_FAILURE'; payload: string };
type UserPlayedAudioAction = { type: 'USER_PLAYED_AUDIO' };
type UserPausedAudioAction = { type: 'USER_PAUSED_AUDIO' };
type AudioPlaybackEndedAction = { type: 'AUDIO_PLAYBACK_ENDED' };


export type Action =
  | UserInputAction
  | UserClearedTextAction
  | ProcessTextSubmittedAction
  | ModelLoadSuccessAction
  | ModelLoadFailureAction
  | ProcessingSuccessAction
  | UserHaltedProcessingAction
  | ProcessingFailureAction
  | UserPlayedAudioAction
  | UserPausedAudioAction
  | AudioPlaybackEndedAction;


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
    // --- Input Lifecycle Cases ---
    case 'USER_INPUT_TEXT':
      return {
        ...state,
        inputLifecycle: 'hasRawText',
      };

    case 'USER_CLEARED_TEXT':
      return {
        ...state,
        inputLifecycle: 'empty',
      };

    // --- Combined Logic Case ---
    case 'PROCESS_TEXT_SUBMITTED':
      // Guard clause: Only process if the state is correct.
      if (
        (state.audioLifecycle === 'idle' || state.audioLifecycle === 'paused') &&
        state.inputLifecycle === 'hasRawText'
      ) {
        return {
          ...state,
          audioLifecycle: 'processing',
          inputLifecycle: 'hasSubmittedText',
          processingRetryCount: 0, // Reset retries for the new job
          errorMessage: null,
        };
      }
      return state; // If conditions are not met, do nothing.

    // --- Audio Lifecycle Cases ---
    case 'MODEL_LOAD_SUCCESS':
      return {
        ...state,
        audioLifecycle: 'idle',
        modelLoadRetryCount: 0, // Reset on success
      };

    case 'MODEL_LOAD_FAILURE':
      const newModelRetryCount = state.modelLoadRetryCount + 1;
      if (newModelRetryCount >= MAX_RETRIES) {
        return {
          ...state,
          audioLifecycle: 'error',
          errorMessage: 'Failed to load the AI model after several retries. Please reload the page.',
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
        processingRetryCount: 0, // Reset on success
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
      // Return to 'idle' and allow the user to resubmit the same text.
      return {
        ...state,
        audioLifecycle: 'idle',
        inputLifecycle: 'hasRawText',
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
