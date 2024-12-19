import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const initialState = {
  provinces: [],
  cities: [],
  isLoading: true,
  error: null,
};

export const fetchProvinces = createAsyncThunk(
  "location/fetchProvinces",
  async () => {
    try {
      const response = await axios.get(`${API_URL}/api/rajaongkir/provinces`);
      return response.data.provinces;
    } catch (error) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    }
  }
);

export const fetchCities = createAsyncThunk(
  "location/fetchCities",
  async (provinceId) => {
    try {
      const response = await axios.get(`${API_URL}/api/rajaongkir/cities`, {
        params: { provinceId },
      });

      return response.data.cities;
    } catch (error) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    }
  }
);

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProvinces.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProvinces.fulfilled, (state, action) => {
        state.isLoading = false;
        state.provinces = action.payload;
      })
      .addCase(fetchProvinces.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchCities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cities = action.payload;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export default locationSlice.reducer;
