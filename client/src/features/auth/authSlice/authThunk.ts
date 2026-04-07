import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/authAxios";
import type { LoginPayload, RegisterPayload, VerifyCodePayload } from "./authTypes";

export const registerThunk = createAsyncThunk(
    "auth/register",
    async (data: RegisterPayload, thunkAPI) => {
        try {
            const response = await api.post("/auth/register", data);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Registration failed"
            );
        }
    }
)

export const verifyCodeThunk = createAsyncThunk(
    "auth/verifyCode",
    async (data: VerifyCodePayload, thunkAPI) => {
        try {
            const response = await api.post("/auth/verify-code", data);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Verification failed"
            );
        }
    }
)

export const loginThunk = createAsyncThunk(
    "auth/login",
    async (data: LoginPayload, thunkAPI) => {
        try {
            const response = await api.post("/auth/login", data);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Login failed"
            );
        }
    }
)

export const getMeThunk = createAsyncThunk(
    "auth/getMe",
    async (_, thunkAPI) => {
        try {
            const response = await api.get("/auth/me");
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Session expired"
            );
        }
    }
)