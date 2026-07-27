// This file is for: Redux store — configureStore with all slices
// Module: Frontend State Management (Module 9)
// Owner: Developer 2 (Web Frontend Engineer)

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import manifestReducer from './manifestSlice';
import vehicleReducer from './vehicleSlice';
import uiReducer from './uiSlice';

// Combine all slice reducers into the central store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    manifest: manifestReducer,
    vehicle: vehicleReducer,
    ui: uiReducer,
  },
  // Redux Toolkit includes redux-thunk and serializable-check middlewares by default
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
