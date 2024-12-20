import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

const API_ADDRESS_URL = import.meta.env.VITE_BACKEND_URL;

const AUTH_URL = API_ADDRESS_URL + "/api/user";

const initialState = {
  isAuthenticated: true,
  isLoading: false,
  loginLoading: false,
  editProfileLoading: false,
  logoutLoading: false,
  checkAuthLoading: false,
  user: null,
};

export const registerUser = createAsyncThunk(
  "/auth/register",
  async (formData) => {
    try {
      const response = await axios.post(
        `${AUTH_URL}/register`,
        formData,
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
      }
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    }
  }
);

export const loginUser = createAsyncThunk("/auth/login", async (formData) => {
  try {
    const response = await axios.post(
      `${AUTH_URL}/login`,
      formData,
      {
        withCredentials: true,
      }
    );
    
    if (response.data.success) {
      toast.success(response.data.message);
    }
  
    return response.data;
  } catch (error) {
    toast.error(error.response.data.message);
    throw new Error(error.response.data.message);
  }
});

// Logout
export const logoutUser = createAsyncThunk("/auth/logout", async () => {
  try {
    const response = await axios.post(
      `${AUTH_URL}/logout`,
      {},
      {
        withCredentials: true,
      }
    );
    
    if (response.data.success) {
      toast.success(response.data.message);
    }
  
    return response.data;
  } catch (error) {
    toast.error(error.response.data.message);
    throw new Error(error.response.data.message);
  }
});

// Edit Profile action
export const editProfile = createAsyncThunk(
  "/auth/editProfile",
  async ({ userId, formData }) => {
    try {
      const response = await axios.put(
        `${AUTH_URL}/edit-profile/${userId}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
      }
  
      return response.data.user;
    } catch (error) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    }
  }
);

// Delete Profile
export const deleteProfile = createAsyncThunk(
  "/auth/deleteProfile",
  async ({ userId }) => {
    try {
      const response = await axios.delete(
        `${AUTH_URL}/delete-profile/${userId}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
      }
  
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    }
  }
);

export const checkAuth = createAsyncThunk("/auth/checkauth", async () => {
  try {
    const response = await axios.get(
      `${AUTH_URL}/check-auth`,
      {
        withCredentials: true,
      }
    );
    
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message); 
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
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
        state.loginLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(loginUser.rejected, (state) => {
        state.loginLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.pending, (state) => {
        state.logoutLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.logoutLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.logoutLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(checkAuth.pending, (state) => {
        state.checkAuthLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.checkAuthLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.checkAuthLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(editProfile.pending, (state) => {
        state.editProfileLoading = true;
      })
      .addCase(editProfile.fulfilled, (state, action) => {
        state.editProfileLoading = false;
        state.user = action.payload;
      })
      .addCase(editProfile.rejected, (state) => {
        state.editProfileLoading = false;
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

export default authSlice.reducer;
