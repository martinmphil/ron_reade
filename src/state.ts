/**
 * Defines the possible states for the core text-to-speech and playback process.
 */
export type AudioLifecycleState =
  | 'modelLoading'
  | 'idle'
  | 'processing'
  | 'halted'
  | 'readyToPlay'
  | 'playing'
  | 'paused'
  | 'error';

/**
 * Defines the possible states for the user's text input lifecycle.
 * - 'empty': The textarea is empty.
 * - 'hasRawText': User has entered new text that has not yet been submitted.
 * - 'hasSubmittedText': Text in the textarea has been submitted for processing.
 */
export type InputLifecycleState = 'empty' | 'hasRawText' | 'hasSubmittedText';

/**
 * Defines the overall application state using a statechart-like model.
 */
export interface AppState {
  audioLifecycle: AudioLifecycleState;
  inputLifecycle: InputLifecycleState;
  modelLoadRetryCount: number;
  processingRetryCount: number;
  errorMessage: string | null;
}

/**
 * The initial state of the application when it first loads.
 */
export const initialState: AppState = {
  audioLifecycle: 'modelLoading',
  inputLifecycle: 'empty',
  modelLoadRetryCount: 0,
  processingRetryCount: 0,
  errorMessage: null,
};
