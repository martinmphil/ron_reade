// src/state.ts

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
  | 'error';

/**
 * Defines the possible states for the user's text input.
 */
export type InputState = 'empty' | 'hasText';

/**
 * Defines the overall application state using a statechart-like model.
 */
export interface AppState {
  audioLifecycle: AudioLifecycleState;
  input: InputState;
  retryCount: number;
  errorMessage: string | null;
}

/**
 * The initial state of the application when it first loads.
 */
export const initialState: AppState = {
  audioLifecycle: 'modelLoading',
  input: 'empty',
  retryCount: 0,
  errorMessage: null,
};
