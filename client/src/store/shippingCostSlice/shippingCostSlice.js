import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";


const API_URL = import.meta.env.VITE_PROD === "production"
  ? import.meta.env.VITE_SHIPPING_API_URL
  : "/api";

const initialState = {
  costs: [],
  isLoading: true,
  error: null,
};

export const fetchShippingCosts = createAsyncThunk(
  "shipping/fetchShippingCosts",
  async ({ origin, destination, weight, courier }) => {
    const response = await axios.post(
      `${API_URL}/starter/cost`,
      new URLSearchParams({
        origin,
        destination,
        weight,
        courier,
      }),
      {
        headers: {
          key: import.meta.env.VITE_RAJAONGKIR_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.rajaongkir.results;
  }
);

const shippingCostSlice = createSlice({
  name: "shipping",
  initialState,
  reducers: {
    resetShippingState: (state) => {
      state.costs = [];
      state.isLoading = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShippingCosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShippingCosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.costs = [...state.costs, ...action.payload];
      })
      .addCase(fetchShippingCosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { resetShippingState } = shippingCostSlice.actions;
export default shippingCostSlice.reducer;
