import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

const API_ADDRESS_URL = import.meta.env.VITE_BACKEND_URL;

const ORDER_URL = API_ADDRESS_URL + "/api/order";

const initialState = {
  items: [],
  selectedItems: {},
  total: 0,
  isCheckoutLoading: false,
  orders: [],
  userOrders: [],
  isLoadingOrders: false,
  errorMessage: "",
  successMessage: "",
  isUploadingProof: false,
  proofUploadSuccess: false,
  proofUploadError: null,
};

export const checkout = createAsyncThunk(
  "/order/checkout",
  async ({ orderData }) => {
    try {
      const response = await axios.post(
        `${ORDER_URL}/checkout`,
        orderData,
        {
          headers: {
            "Content-Type": "application/json",
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

export const getAllOrders = createAsyncThunk(
  "/order/getAllOrders",
  async ({ page = 1, limit = 10 }) => {
    try {
      const response = await axios.get(`${ORDER_URL}/all`, {
        params: { page, limit },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    }
  }
);

export const getUserOrders = createAsyncThunk(
  "/order/getUserOrders",
  async ({ page = 1, limit = 10 }) => {
    try {
      const response = await axios.get(
        `${ORDER_URL}/user-orders`,
        {
          params: { page, limit },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    }
  }
);

export const uploadPaymentProof = createAsyncThunk(
  "/order/uploadPaymentProof",
  async ({ orderId, paymentProof }) => {
    try {
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("paymentProof", paymentProof);
      
      const response = await axios.post(
        `${ORDER_URL}/upload-payment-proof`,
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

// Async Thunk untuk mengubah status order
export const updateOrderStatus = createAsyncThunk(
  "/order/updateOrderStatus",
  async ({ orderId, newStatus, trackingCode, products }) => {
    try {
      const payload = { newStatus };
      if (newStatus === "ondelivery" && trackingCode) {
        payload.trackingCode = trackingCode;
      }

      if (newStatus === "process" && products) {
        payload.products = products;
      }

      const response = await axios.put(
        `${ORDER_URL}/update-status/${orderId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
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

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: { },
  extraReducers: (builder) => {
    builder
      .addCase(checkout.pending, (state) => {
        state.isCheckoutLoading = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(checkout.fulfilled, (state, action) => {
        state.isCheckoutLoading = false;
        state.successMessage = action.payload.message || "Checkout successful!";
        state.items = [];
      })
      .addCase(checkout.rejected, (state, action) => {
        state.isCheckoutLoading = false;
        state.errorMessage = action.error.message || "Failed to checkout.";
      })
      .addCase(getAllOrders.pending, (state) => {
        state.isLoadingOrders = true;
        state.errorMessage = "";
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.isLoadingOrders = false;
        state.orders = action.payload.orders || [];
        state.totalOrders = action.payload.totalOrders || 0;
        state.totalPages = action.payload.totalPages || 0;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.isLoadingOrders = false;
        state.errorMessage =
          action.error.message || "Failed to get all orders.";
      })
      .addCase(getUserOrders.pending, (state) => {
        state.isLoadingOrders = true;
        state.errorMessage = "";
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.isLoadingOrders = false;
        state.userOrders = action.payload.userOrders || [];
        state.totalUserOrders = action.payload.totalUserOrders || 0;
        state.totalUserPages = action.payload.totalPages || 0;
        state.currentUserPage = action.payload.currentPage || 1;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.isLoadingOrders = false;
        state.errorMessage =
          action.error.message || "Failed to get user orders.";
      })
      .addCase(uploadPaymentProof.pending, (state) => {
        state.isUploadingProof = true;
        state.proofUploadError = null;
        state.proofUploadSuccess = false;
      })
      .addCase(uploadPaymentProof.fulfilled, (state, action) => {
        state.isUploadingProof = false;
        state.proofUploadSuccess = true;
        const updatedOrder = action.payload.order;

        if (updatedOrder) {
          const userOrderIndex = state.userOrders.findIndex(
            (order) => order._id === updatedOrder._id
          );
          if (userOrderIndex !== -1) {
            state.userOrders[userOrderIndex] = {
              ...state.userOrders[userOrderIndex],
              paymentProof: updatedOrder.paymentProof,
              paymentStatus: updatedOrder.paymentStatus,
              updatedAt: updatedOrder.updatedAt,
            };
          }

          const orderIndex = state.orders.findIndex(
            (order) => order._id === updatedOrder._id
          );
          if (orderIndex !== -1) {
            state.orders[orderIndex] = {
              ...state.orders[orderIndex],
              paymentProof: updatedOrder.paymentProof,
              paymentStatus: updatedOrder.paymentStatus,
              updatedAt: updatedOrder.updatedAt,
            };
          }
        }
      })
      .addCase(uploadPaymentProof.rejected, (state, action) => {
        state.isUploadingProof = false;
        state.proofUploadError =
          action.payload || "Failed to upload payment proof.";
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.isUpdatingStatus = true;
        state.updateStatusError = null;
        state.updateStatusSuccess = false;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isUpdatingStatus = false;
        state.updateStatusSuccess = true;
        const updatedOrder = action.payload.order;

        if (updatedOrder) {
          const userOrderIndex = state.userOrders.findIndex(
            (order) => order._id === updatedOrder._id
          );
          if (userOrderIndex !== -1) {
            state.userOrders[userOrderIndex] = {
              ...state.userOrders[userOrderIndex],
              status: updatedOrder.status,
              updatedAt: updatedOrder.updatedAt,
            };
          }

          const orderIndex = state.orders.findIndex(
            (order) => order._id === updatedOrder._id
          );
          if (orderIndex !== -1) {
            state.orders[orderIndex] = {
              ...state.orders[orderIndex],
              status: updatedOrder.status,
              updatedAt: updatedOrder.updatedAt,
            };
          }
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isUpdatingStatus = false;
        state.updateStatusError =
          action.payload || "Failed to update order status.";
      });
  },
});

export default checkoutSlice.reducer;
