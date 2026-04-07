import { createSlice } from "@reduxjs/toolkit";
import type { AuthState } from "./authTypes";
import { getMeThunk, loginThunk, registerThunk, verifyCodeThunk } from "./authThunk";

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem("token") || sessionStorage.getItem("token"),
    loading: false,
    error: null
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            state.loading = false;
            state.error = null;
        },
        clearError: (state) => { state.error = null },
        setToken: (state, action: { payload: string }) => {
            state.token = action.payload;
        }
    },
    extraReducers(builder) {
        //register
        builder
            .addCase(registerThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerThunk.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(registerThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
        //verify code   
        builder
            .addCase(verifyCodeThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyCodeThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                if (action.meta.arg.rememberMe) {
                    localStorage.setItem("token", action.payload.token);
                } else {
                    sessionStorage.setItem("token", action.payload.token);
                }

            })
            .addCase(verifyCodeThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
        //login
        builder
            .addCase(loginThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                if (action.meta.arg.rememberMe) {
                    localStorage.setItem("token", action.payload.token);
                } else {
                    sessionStorage.setItem("token", action.payload.token);
                }
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

        //get me
        builder
            .addCase(getMeThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(getMeThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
            })
            .addCase(getMeThunk.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                localStorage.removeItem("token");
                   sessionStorage.removeItem("token");
            })
    },
})

export const { logout, clearError, setToken } = authSlice.actions;
export default authSlice.reducer;