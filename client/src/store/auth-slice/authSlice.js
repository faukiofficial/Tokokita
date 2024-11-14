import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_ADDRESS_URL = import.meta.env.VITE_BACKEND_URL;

const AUTH_URL = API_ADDRESS_URL + "/api/user";

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

export const registerUser = createAsyncThunk(
  "/auth/register",
  async (formData) => {
    const response = await axios.post(
      `${AUTH_URL}/register`,
      formData,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const loginUser = createAsyncThunk("/auth/login", async (formData) => {
  const response = await axios.post(
    `${AUTH_URL}/login`,
    formData,
    {
      withCredentials: true,
    }
  );

  return response.data;
});

// Logout
export const logoutUser = createAsyncThunk("/auth/logout", async () => {
  const response = await axios.post(
    `${AUTH_URL}/logout`,
    {},
    {
      withCredentials: true,
    }
  );

  return response.data;
});

// Edit Profile action
export const editProfile = createAsyncThunk(
  "/auth/editProfile",
  async ({ userId, formData }) => {
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await axios.put(
      `${AUTH_URL}/edit-profile/${userId}`,
      formData,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data.user;
  }
);

// Delete Profile
export const deleteProfile = createAsyncThunk(
  "/auth/deleteProfile",
  async ({ userId }) => {
    console.log('id delete', userId);
    
    const response = await axios.delete(
      `${AUTH_URL}/delete-profile/${userId}`,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  }
);

export const checkAuth = createAsyncThunk("/auth/checkauth", async () => {
  const response = await axios.get(
    `${AUTH_URL}/check-auth`,
    {
      withCredentials: true,
    }
  );

  return response.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        console.log("Check Auth Payload:", action.payload);
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(editProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(editProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(editProfile.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProfile.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false
        state.user = null;
      })
      .addCase(deleteProfile.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setUser } = authSlice.actions;

export default authSlice.reducer;
