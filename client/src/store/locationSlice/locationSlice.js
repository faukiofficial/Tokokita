import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_PROD === "production"
  ? import.meta.env.VITE_SHIPPING_API_URL
  : "/api";

const initialState = {
  provinces: [],
  cities: [],
  isLoading: true,
  error: null,
};

// Async thunk for fetching provinces
export const fetchProvinces = createAsyncThunk(
  "location/fetchProvinces",
  async () => {
    const response = await axios.get(`${API_URL}/starter/province`, {
      headers: {
        key: import.meta.env.VITE_RAJAONGKIR_KEY,
      },
    });
    console.log("Province request:", response);
    return response.data.rajaongkir.results;
  }
);

// Async thunk for fetching cities based on province
export const fetchCities = createAsyncThunk(
  "location/fetchCities",
  async (provinceId) => {
    const response = await axios.get(`${API_URL}/starter/city`, {
      params: { province: provinceId },
      headers: {
        key: import.meta.env.VITE_RAJAONGKIR_KEY, 
      },
    });
    console.log('kota dari slice',response.data.rajaongkir.results);
    
    return response.data.rajaongkir.results;
  }
);

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setLocation : (state, action) => {}
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProvinces.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProvinces.fulfilled, (state, action) => {
        console.log('ini dia',action.payload);
        state.isLoading = false;
        state.provinces = action.payload;
      })
      .addCase(fetchProvinces.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });

    builder
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

export const {setLocation} = locationSlice.actions;

export default locationSlice.reducer;
