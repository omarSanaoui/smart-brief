import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice/authSlice"
import briefReducer from "../features/briefs/briefSlice/briefSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        briefs: briefReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch