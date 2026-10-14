import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '../api/baseApi.js';
import {
  authReducer,
  sessionEnded,
  sessionFromTokens,
  sessionRefreshed,
  sessionStarted,
} from '../features/auth/authSlice.js';
import { registerAuthListeners, syncSessionAcrossTabs } from '../features/auth/authListeners.js';
import { loadStoredTokens } from '../features/auth/authStorage.js';
import { uiReducer } from '../features/ui/uiSlice.js';
import { stopRealtime, syncRealtime } from '../lib/realtime/chatHub.js';

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

// The real-time hub follows the session: started with one, stopped on logout (the project guide
// 6.17). A refresh keeps the same user and changes nothing.
listenerMiddleware.startListening({
  matcher: isAnyOf(sessionStarted, sessionRefreshed),
  effect: () => syncRealtime(store),
});
listenerMiddleware.startListening({ actionCreator: sessionEnded, effect: () => stopRealtime() });
syncRealtime(store);

// Lets queries refetch when the window gets focus again (`refetchOnFocus`, the unread count).
setupListeners(store.dispatch);
