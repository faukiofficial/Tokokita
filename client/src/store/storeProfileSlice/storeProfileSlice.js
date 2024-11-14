import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_ADDRESS_URL = import.meta.env.VITE_BACKEND_URL;

const STORE_PROFILE_URL = API_ADDRESS_URL + "/api/store-profile";

const initialState = {
  storeProfile: null,
  loading: false,
  error: null,
};

// 1. Create Store Profile
export const createStoreProfile = createAsyncThunk(
  "storeProfile/createStoreProfile",
  async ({ storeProfileData }) => {
    console.log("storeProfileData dari slice", storeProfileData);
    try {
      const response = await axios.post(`${STORE_PROFILE_URL}/add`, storeProfileData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data.storeProfile;
    } catch (error) {
      const message = error.response?.data?.message;
      throw new Error(message);
    }
  }
);

// Get Store Profile
export const getStoreProfile = createAsyncThunk(
  "storeProfile/getStoreProfile",
  async () => {
    try {
      const response = await axios.get(`${STORE_PROFILE_URL}/get`);
      return response.data.storeProfile;
    } catch (error) {
      const message = error.response?.data?.message;
      throw new Error(message);
    }
  }
);

// Update Store Profile
export const updateStoreProfile = createAsyncThunk(
  "storeProfile/updateStoreProfile",
  async ({ storeProfileData }) => {
    console.log("storeProfileData dari slice", storeProfileData);
    try {
      const response = await axios.put(
        `${STORE_PROFILE_URL}/update`,
        storeProfileData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.storeProfile;
    } catch (error) {
      const message = error.response?.data?.message;
      throw new Error(message);
    }
  }
);

// Slice
const storeProfileSlice = createSlice({
  name: "storeProfile",
  initialState,
  reducers: {
    clearStoreProfile(state) {
      state.storeProfile = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createStoreProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(createStoreProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.storeProfile = action.payload;
      })
      .addCase(createStoreProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getStoreProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStoreProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.storeProfile = action.payload;
      })
      .addCase(getStoreProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateStoreProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStoreProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.storeProfile = action.payload;
      })
      .addCase(updateStoreProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

// Export actions and reducer
export const { clearStoreProfile } = storeProfileSlice.actions;
export default storeProfileSlice.reducer;
