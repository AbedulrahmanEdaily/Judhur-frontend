import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi.js';
import { authReducer, sessionFromTokens } from '../features/auth/authSlice.js';
import { registerAuthListeners, syncSessionAcrossTabs } from '../features/auth/authListeners.js';
import { loadStoredTokens } from '../features/auth/authStorage.js';
import { uiReducer } from '../features/ui/uiSlice.js';

const listenerMiddleware = createListenerMiddleware();
registerAuthListeners(listenerMiddleware.startListening);

/** The persisted session, read before the first render. */
function preloadedAuth() {
  const tokens = loadStoredTokens();
  return tokens ? sessionFromTokens(tokens) : undefined;
}

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    ui: uiReducer,
  },
  preloadedState: { auth: preloadedAuth() },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware).concat(baseApi.middleware),
});

syncSessionAcrossTabs(store);
