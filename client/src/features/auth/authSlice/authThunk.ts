import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "../api/authAxios";
import type { ChangePasswordPayload, DeleteMePayload, LoginPayload, RegisterPayload, UpdateMePayload, VerifyCodePayload } from "./authTypes";

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof AxiosError) {
        return (error.response?.data as { message?: string } | undefined)?.message || fallback;
    }
    return fallback;
};

export const registerThunk = createAsyncThunk(
    "auth/register",
    async (data: RegisterPayload, thunkAPI) => {
        try {
            const response = await api.post("/auth/register", data);
            return response.data;
        } catch (error: unknown) {
            return thunkAPI.rejectWithValue(getErrorMessage(error, "Registration failed"));
        }
    }
)

export const verifyCodeThunk = createAsyncThunk(
    "auth/verifyCode",
    async (data: VerifyCodePayload, thunkAPI) => {
        try {
            const response = await api.post("/auth/verify-code", data);
            return response.data;
        } catch (error: unknown) {
            return thunkAPI.rejectWithValue(getErrorMessage(error, "Verification failed"));
        }
    }
)

export const loginThunk = createAsyncThunk(
    "auth/login",
    async (data: LoginPayload, thunkAPI) => {
        try {
            const response = await api.post("/auth/login", data);
            return response.data;
        } catch (error: unknown) {
            return thunkAPI.rejectWithValue(getErrorMessage(error, "Login failed"));
        }
    }
)

export const getMeThunk = createAsyncThunk(
    "auth/getMe",
    async (_, thunkAPI) => {
        try {
            const response = await api.get("/auth/me");
            return response.data;
        } catch (error: unknown) {
            return thunkAPI.rejectWithValue(getErrorMessage(error, "Session expired"));
        }
    }
)

export const updateMeThunk = createAsyncThunk(
    "auth/updateMe",
    async (data: UpdateMePayload, thunkAPI) => {
        try {
            const response = await api.patch("/auth/me", data);
            return response.data;
        } catch (error: unknown) {
            return thunkAPI.rejectWithValue(getErrorMessage(error, "Update failed"));
        }
    }
)

export const changePasswordThunk = createAsyncThunk(
    "auth/changePassword",
    async (data: ChangePasswordPayload, thunkAPI) => {
        try {
            const response = await api.post("/auth/change-password", data);
            return response.data;
        } catch (error: unknown) {
            return thunkAPI.rejectWithValue(getErrorMessage(error, "Password change failed"));
        }
    }
)

export const resendCodeThunk = createAsyncThunk(
    "auth/resendCode",
    async (email: string, thunkAPI) => {
        try {
            const response = await api.post("/auth/resend-code", { email });
            return response.data;
        } catch (error: unknown) {
            return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to resend code"));
        }
    }
)

export const deleteMeThunk = createAsyncThunk(
    "auth/deleteMe",
    async (data: DeleteMePayload | undefined, thunkAPI) => {
        try {
            await api.delete("/auth/me", { data });
            return true;
        } catch (error: unknown) {
            return thunkAPI.rejectWithValue(getErrorMessage(error, "Account deletion failed"));
        }
    }
)
