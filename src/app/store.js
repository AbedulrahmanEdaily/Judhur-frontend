import { configureStore } from '@reduxjs/toolkit';
import { uiReducer } from '../features/ui/uiSlice.js';

// The RTK Query api reducer and the auth slice join in build step 3.
export const store = configureStore({
  reducer: {
    ui: uiReducer,
  },
});
