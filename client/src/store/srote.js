import { configureStore } from "@reduxjs/toolkit";
import authReducer from './auth-slice/authSlice'
import productReducer from './productSlice/productSlice'
import cartReducer from './cartSlice/cartSlice'
import orderReducer from './orderSlice/orderSlice'
import locationReducer from './locationSlice/locationSlice'
import shippingReducer from './shippingCostSlice/shippingCostSlice'
import addressReducer from './addressForm-slice/addressFormSlice'
import storeProfileReducer from './storeProfileSlice/storeProfileSlice'

const store = configureStore({
    reducer : {
        auth : authReducer,
        product : productReducer,
        cart : cartReducer,
        order : orderReducer,
        location : locationReducer,
        shipping : shippingReducer,
        address : addressReducer,
        storeProfile : storeProfileReducer,
    }
})

export default store