import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import interviewReducer from '../features/interview/interviewSlice.js';
import testReducer from '../features/test/testSlice.js';
import historyReducer from '../features/history/historySlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    interview: interviewReducer,
    test: testReducer,
    history: historyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setUser'],
        ignoredPaths: ['auth.user'],
      },
    }),
});

export default store;
