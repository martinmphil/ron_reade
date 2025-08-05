/**
 * Defines the possible states for the core text-to-speech and playback process.
 */
export type AudioLifecycleState =
  | 'modelLoading'
  | 'idle'
  | 'processing'
  | 'readyToPlay'
  | 'playing'
  | 'paused'
  | 'error';



/**
 * Defines the overall application state using a statechart-like model.
 */
export interface AppState {
  audioLifecycle: AudioLifecycleState;
  
  modelLoadRetryCount: number;
  processingRetryCount: number;
  errorMessage: string | null;
  processingProgress: number;
  processingTotal: number;
  lastProcessedText: string | null;
  loadingDots: number;
}

/**
 * The initial state of the application when it first loads.
 */
export const initialState: AppState = {
  audioLifecycle: 'modelLoading',
  modelLoadRetryCount: 0,
  processingRetryCount: 0,
  errorMessage: null,
  processingProgress: 0,
  processingTotal: 0,
  lastProcessedText: null,
  loadingDots: 0,
};
