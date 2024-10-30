import { configureStore } from '@reduxjs/toolkit';
import salesListReducer from './salesListSlice';

export const store = configureStore({
  reducer: {
    salesList: salesListReducer,
  },
});