// src/state.test.ts

import { describe, it, expect } from 'vitest';
import { initialState, type AppState } from './state';

describe('Application State Machine', () => {

  it('should have the correct initial state when the app loads', () => {
    const expectedInitialState: AppState = {
      audioLifecycle: 'modelLoading',
      input: 'empty',
      retryCount: 0,
      errorMessage: null,
    };

    expect(initialState).toEqual(expectedInitialState);
  });

  // Add more tests here for state transitions later.
  // For example:
  // it('should transition from modelLoading to idle on success', () => { ... });
  // it('should transition from empty to hasText when user types', () => { ... });

});
