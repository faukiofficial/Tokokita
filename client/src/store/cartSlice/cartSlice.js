import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

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


export const getCart = createAsyncThunk('/cart/getCart', async () => {
  const response = await axios.get(CART_URL, {
    withCredentials: true,
  });
  return response.data;
});

export const addToCart = createAsyncThunk('/cart/addToCart', async ({ productId, quantity }) => {
  const response = await axios.post(
    `${CART_URL}/add`, 
    { productId, quantity }, 
    {
      withCredentials: true,
    }
  );
  return response.data;
});

export const removeFromCart = createAsyncThunk('/cart/removeFromCart', async ({ productId }) => {
  const response = await axios.post(
    `${CART_URL}/remove`, 
    { productId }, 
    {
      withCredentials: true,
    }
  );
  return { data: response.data, productId };
});

export const updateCartItem = createAsyncThunk('/cart/updateCartItem', async ({ productId, quantity }) => {
  const response = await axios.post(
    `${CART_URL}/update`, 
    { productId, quantity }, 
    {
      withCredentials: true,
    }
  );
  return { data: response.data, productId };
});

export const clearCart = createAsyncThunk('/cart/clearCart', async () => {
  const response = await axios.post(`${CART_URL}/clear`, {}, {
    withCredentials: true,
  });
  return response.data;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCartState: (state) => {
      state.cart = null;
      state.isLoading = false;
      state.errorMessage = "";
      state.successMessage = "";
      state.updatingItemId = null;
      state.removingItemId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
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

export const { resetCartState } = cartSlice.actions;

export default cartSlice.reducer;
