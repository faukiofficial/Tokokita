import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_ADDRESS_URL = import.meta.env.VITE_BACKEND_URL;

const ADDRESS_URL = API_ADDRESS_URL + "/api/address";

const initialState = {
  addresses: [],
  currentAddress: null,
  loading: false,
  error: null,
};

// 1. Get All Addresses
export const getAllAddress = createAsyncThunk(
  "address/getAllAddress",
  async () => {
    try {
      const response = await axios.get(`${ADDRESS_URL}/get`, {
        withCredentials: true,
      });

      return response.data.addressList;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed get All address list";
      throw new Error(message);
    }
  }
);

// 2. Get Address by ID
export const getAddressById = createAsyncThunk(
  "address/getAddressById",
  async ({ id }) => {
    try {
      const response = await axios.get(`${ADDRESS_URL}/get/${id}`, {
        withCredentials: true,
      });
      return response.data.address;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to get address by ID";
      throw new Error(message);
    }
  }
);

// 3. Add Address
export const addNewAddress = createAsyncThunk(
  "address/addNewAddress",
  async ({ addressData }) => {
    try {
      const response = await axios.post(`${ADDRESS_URL}/add`, addressData, {
        withCredentials: true,
      });
      console.log("Add Address Response:", response.data);
      return response.data.address;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create address";
      throw new Error(message);
    }
  }
);

// 4. Update Address
export const updateAddress = createAsyncThunk(
  "address/updateAddress",
  async ({ id, addressData }) => {
    try {
      const response = await axios.put(
        `${ADDRESS_URL}/edit/${id}`,
        addressData,
        {
          withCredentials: true,
        }
      );
      return response.data.address;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update address";
      throw new Error(message);
    }
  }
);

// 5. Delete Address
export const deleteAddress = createAsyncThunk(
  "address/deleteAddress",
  async ({ id }) => {
    try {
      await axios.delete(`${ADDRESS_URL}/delete/${id}`, {
        withCredentials: true,
      });
      return id;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete address";
      throw new Error(message);
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    clearCurrentAddress(state) {
      state.currentAddress = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllAddress.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(getAllAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getAddressById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAddressById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAddress = action.payload;
      })
      .addCase(getAddressById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addNewAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNewAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses.push(action.payload);
      })
      .addCase(addNewAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.addresses.findIndex(
          (addr) => addr._id === action.payload._id
        );
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
        state.currentAddress = null;
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = state.addresses.filter(
          (addr) => addr._id !== action.payload
        );
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearCurrentAddress } = addressSlice.actions;
export default addressSlice.reducer;
