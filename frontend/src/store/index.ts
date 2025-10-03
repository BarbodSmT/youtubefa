import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/api';
// Import Reducers
import youtubeChannelsReducer from './slices/youtubeChannelsSlice';
import authReducer from './slices/authSlice';
import submissionsReducer from './slices/submissionsSlice';
import categoriesReducer from './slices/categoriesSlice';

// 1. Import all API thunks and slice actions

// From Auth
export * from './slices/authSlice';

// From Submissions
export * from './slices/submissionsSlice';

// From YouTube Channels
export * from './slices/youtubeChannelsSlice';

export * from './slices/categoriesSlice';

export * from './api/api';

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    youtubeChannels: youtubeChannelsReducer,
    auth: authReducer,
    submissions: submissionsReducer,
    categories: categoriesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;