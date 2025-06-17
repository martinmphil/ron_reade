import { describe, it, expect } from 'vitest';
import { initialState, type AppState, type InputLifecycleState } from './state';

describe('Application State Machine', () => {

  it('should have the correct initial state when the app loads', () => {
    const expectedInitialState: AppState = {
      audioLifecycle: 'modelLoading',
      inputLifecycle: 'empty',
      retryCount: 0,
      errorMessage: null,
    };

    expect(initialState).toEqual(expectedInitialState);
  });

  // Add more tests here for state transitions later.
  // For example:
  // it('should transition from modelLoading to idle on success', () => { ... });
  // it('should transition from empty to hasRawText when user types', () => { ... });

});