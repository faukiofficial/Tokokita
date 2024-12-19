import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const initialState = {
  costs: [],
  isLoading: true,
  error: null,
};

export const fetchShippingCosts = createAsyncThunk(
  "shipping/fetchShippingCosts",
  async ({ origin, destination, weight, courier }) => {
    const body = {
      origin,
      destination,
      weight,
      courier,
    };
    try {
      const response = await axios.post(
        `${API_URL}/api/rajaongkir/get-shipping-cost`,
        body
      );

      return response.data.rajaongkir.results;
    } catch (error) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    }
  }
);

const shippingCostSlice = createSlice({
  name: "shipping",
  initialState,
  reducers: {},
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

export default shippingCostSlice.reducer;
