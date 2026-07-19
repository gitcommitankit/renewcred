import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import { authApi } from './api/authApi';
import { standardsApi } from './api/standardsApi';
import { versionsApi } from './api/versionsApi';
import { pagesApi } from './api/pagesApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [authApi.reducerPath]: authApi.reducer,
    [standardsApi.reducerPath]: standardsApi.reducer,
    [versionsApi.reducerPath]: versionsApi.reducer,
    [pagesApi.reducerPath]: pagesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      standardsApi.middleware,
      versionsApi.middleware,
      pagesApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
