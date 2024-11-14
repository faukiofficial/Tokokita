import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_ADDRESS_URL = import.meta.env.VITE_BACKEND_URL;

const PRODUCT_URL = API_ADDRESS_URL + "/api/products";

// Initial State
const initialState = {
  product: null,
  allproducts: null,
  totalProducts: 0,
  isLoading: false,
  isDeleteLoading: false,
  getProductByIdLoading: false,
  errorMessage: "",
  successMessage: "",
};

// Async Thunk untuk menambah produk
export const addProduct = createAsyncThunk(
  "/products/add",
  async ({ formData }) => {

    const response = await axios.post(
      PRODUCT_URL,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );

    return response.data;
  }
);

// Async Thunk untuk mengedit produk
export const editProduct = createAsyncThunk(
  "/products/edit",
  async ({ formData, productId }) => {
    const response = await axios.put(
      `${PRODUCT_URL}/${productId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );

    return response.data;
  }
);

// Async Thunk untuk delete produk
export const deleteProductById = createAsyncThunk(
  "/products/delete",
  async ({ productId }) => {
    const response = await axios.delete(
      `${PRODUCT_URL}/${productId}`,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

// Async Thunk untuk get all produk
export const getAllProduct = createAsyncThunk(
  "/products/getAllProduct",
  async ({
    searchQuery = "",
    selectedCategory = "",
    sortField = "createdAt",
    sortDirection = -1,
    limit = 10,
    page = 1,
  }) => {
    const response = await axios.get(
      `${PRODUCT_URL}?category=${selectedCategory}&search=${searchQuery}&sortField=${sortField}&sortDirection=${sortDirection}&limit=${limit}&page=${page}`
    );

    return response.data;
  }
);

// Async Thunk untuk get produk by id
export const getProductById = createAsyncThunk(
  "/products/getProductById",
  async (productId) => {
    const response = await axios.get(
      `${PRODUCT_URL}/${productId}`
    );

    return response.data;
  }
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProduct: (state, action) => {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(addProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage =
          action.payload.message || "Failed to upload product.";
      })
      .addCase(editProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage =
          action.payload.message || "Failed to edit product.";
      })
      .addCase(deleteProductById.pending, (state) => {
        state.isDeleteLoading = true;
      })
      .addCase(deleteProductById.fulfilled, (state, action) => {
        state.isDeleteLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(deleteProductById.rejected, (state, action) => {
        state.isDeleteLoading = false;
        state.errorMessage =
          action.payload.message || "Failed to delete product.";
      })
      .addCase(getAllProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allproducts = action.payload.products;
        state.totalProducts = action.payload.totalProducts;
        state.successMessage = action.payload.message;
      })
      .addCase(getAllProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.allproducts = null;
        state.errorMessage =
          action.payload.message || "Failed to get products.";
      })
      .addCase(getProductById.pending, (state) => {
        state.getProductByIdLoading = true;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.getProductByIdLoading = false;
        state.product = action.payload;
      })
      .addCase(getProductById.rejected, (state) => {
        state.getProductByIdLoading = false;
        state.product = null;
      });
  },
});

export const { setProduct, resetProductState } = productSlice.actions;

export default productSlice.reducer;
