// salesListSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const salesListSlice = createSlice({
  name: 'sales',
  initialState: {
    value: [],
  },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
  },
});

export const { increment, decrement } = salesListSlice.actions;

export const selectSales = (state) => state.sales.value;

export default salesListSlice.reducer;