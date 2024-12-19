import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

const API_ADDRESS_URL = import.meta.env.VITE_BACKEND_URL;

const PRODUCT_URL = API_ADDRESS_URL + "/api/products";

const initialState = {
  product: null,
  allproducts: [],
  totalProducts: 0,
  isLoading: false,
  addProductLoading: false,
  editProductLoading: false,
  isDeleteLoading: false,
  getProductByIdLoading: false,
  errorMessage: "",
  successMessage: "",
};

export const addProduct = createAsyncThunk(
  "/products/add",
  async ({ formData }) => {
    try {
      const response = await axios.post(PRODUCT_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
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

// Async Thunk untuk mengedit produk
export const editProduct = createAsyncThunk(
  "/products/edit",
  async ({ formData, productId }) => {
    try {
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

// Async Thunk untuk delete produk
export const deleteProductById = createAsyncThunk(
  "/products/delete",
  async ({ productId }) => {
    try {
      const response = await axios.delete(`${PRODUCT_URL}/${productId}`, {
        withCredentials: true,
      });
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
    try {
      const response = await axios.get(`${PRODUCT_URL}`, {
        params: {
          category: selectedCategory,
          search: searchQuery,
          sortField: sortField,
          sortDirection: sortDirection,
          limit: limit,
          page: page,
        },
      });

      return response.data;
    } catch (error) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    }
  }
);

// Async Thunk untuk get produk by id
export const getProductById = createAsyncThunk(
  "/products/getProductById",
  async (productId) => {
    try {
      const response = await axios.get(`${PRODUCT_URL}/${productId}`);
      return response.data.product;
    } catch (error) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addProduct.pending, (state) => {
        state.addProductLoading = true;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.addProductLoading = false;
        state.successMessage = action.payload.message;
        state.allproducts = [...state.allproducts, action.payload.product];
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.addProductLoading = false;
        state.errorMessage =
          action.payload.message || "Failed to upload product.";
      })
      .addCase(editProduct.pending, (state) => {
        state.editProductLoading = true;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.editProductLoading = false;
        state.successMessage = action.payload.message;
        state.product = action.payload.product;
        state.allproducts = state.allproducts.map((product) => {
          if (product._id === action.payload.product._id) {
            return action.payload.product;
          }
          return product;
        });
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.editProductLoading = false;
        state.errorMessage =
          action.payload.message || "Failed to edit product.";
      })
      .addCase(deleteProductById.pending, (state) => {
        state.isDeleteLoading = true;
      })
      .addCase(deleteProductById.fulfilled, (state, action) => {
        state.isDeleteLoading = false;
        state.successMessage = action.payload.message;
        state.allproducts = state.allproducts.filter(
          (product) => product._id !== action.meta.arg.productId
        );
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

export default productSlice.reducer;
