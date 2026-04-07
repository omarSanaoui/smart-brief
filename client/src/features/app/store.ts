import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../auth/authSlice/authSlice";
import briefReducer from "../briefs/briefSlice/briefSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        briefs: briefReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;