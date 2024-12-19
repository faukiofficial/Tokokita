import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

const API_ADDRESS_URL = import.meta.env.VITE_BACKEND_URL;

const CART_URL = API_ADDRESS_URL + "/api/cart";

const initialState = {
  cart: null,
  isLoading: false,
  isUpdating: false,
  isQuantityUpdateting: false,
  updatingItemId: null,
  isRemoving: false,
  removingItemId: null,
  errorMessage: "",
  successMessage: "",
};

export const getCart = createAsyncThunk("/cart/getCart", async () => {
  try {
    const response = await axios.get(CART_URL, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message);
  }
});

export const addToCart = createAsyncThunk(
  "/cart/addToCart",
  async ({ productId, quantity }) => {
    try {
      const response = await axios.post(
        `${CART_URL}/add`,
        { productId, quantity },
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

export const removeFromCart = createAsyncThunk(
  "/cart/removeFromCart",
  async ({ productId }) => {
    try {
      const response = await axios.post(
        `${CART_URL}/remove`,
        { productId },
        {
          withCredentials: true,
        }
      );

      return { data: response.data, productId };
    } catch (error) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "/cart/updateCartItem",
  async ({ productId, quantity }) => {
    try {
      const response = await axios.post(
        `${CART_URL}/update`,
        { productId, quantity },
        {
          withCredentials: true,
        }
      );
      return { data: response.data, productId };
    } catch (error) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    }
  }
);

export const clearCart = createAsyncThunk("/cart/clearCart", async () => {
  try {
    const response = await axios.post(
      `${CART_URL}/clear`,
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

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload.cart;
      })
      .addCase(getCart.rejected, (state) => {
        state.isLoading = false;
        state.errorMessage = "Failed to get cart.";
      })
      .addCase(addToCart.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.cart = action.payload.cart;
        state.successMessage = action.payload.message;
      })
      .addCase(addToCart.rejected, (state) => {
        state.isUpdating = false;
        state.errorMessage = "Failed to add to cart.";
      })
      .addCase(removeFromCart.pending, (state, action) => {
        state.isRemoving = true;
        state.removingItemId = action.meta.arg.productId;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isRemoving = false;
        state.removingItemId = null;
        state.cart = action.payload.data.cart;
        state.successMessage = action.payload.message;
      })
      .addCase(removeFromCart.rejected, (state) => {
        state.isRemoving = false;
        state.removingItemId = null;
        state.errorMessage = "Failed to remove from cart.";
      })
      .addCase(updateCartItem.pending, (state, action) => {
        state.isQuantityUpdateting = true;
        state.updatingItemId = action.meta.arg.productId;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isQuantityUpdateting = false;
        state.updatingItemId = null;
        state.cart = action.payload.data.cart;
        state.successMessage = action.payload.message;
      })
      .addCase(updateCartItem.rejected, (state) => {
        state.isQuantityUpdateting = false;
        state.updatingItemId = null;
        state.errorMessage = "Failed to update cart.";
      })
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload.cart;
        state.successMessage = action.payload.message;
      })
      .addCase(clearCart.rejected, (state) => {
        state.isLoading = false;
        state.errorMessage = "Failed to clear cart.";
      });
  },
});

export default cartSlice.reducer;
