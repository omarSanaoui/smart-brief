import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "../api/briefAxios"; 
import AuthApi from "../../../api/axiosAuth";
import type { CreateBriefPayload, UpdateBriefPayload, CreateTaskPayload, UpdateTaskPayload, UpdateTaskStatusPayload } from "./briefTypes";

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof AxiosError) {
        return (error.response?.data as { message?: string } | undefined)?.message || fallback;
    }
    return fallback;
};

export const fetchBriefsThunk = createAsyncThunk(
    "briefs/fetchAll",
    async (_, thunkAPI) => {
        try {
            const response = await api.get("/briefs");
            return response.data;
        } catch (error: unknown) {
             return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to fetch briefs"));
        }
    }
);

export const fetchBriefByIdThunk = createAsyncThunk(
    "briefs/fetchById",
    async (id: string, thunkAPI) => {
        try {
            const response = await api.get(`/briefs/${id}`);
            return response.data;
        } catch (error: unknown) {
             return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to fetch brief"));
        }
    }
);

export const createBriefThunk = createAsyncThunk(
    "briefs/create",
    async (data: CreateBriefPayload, thunkAPI) => {
        try {
            const response = await api.post("/briefs", data);
            return response.data;
        } catch (error: unknown) {
             return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to create brief"));
        }
    }
);

export const updateBriefThunk = createAsyncThunk(
    "briefs/update",
    async ({ id, data, userRole }: UpdateBriefPayload & { userRole?: string }, thunkAPI) => {
        try {
            // If the payload contains only status/reason, call the role-specific status endpoint
            if (data.status && Object.keys(data).length <= 2) {
                let endpoint = `/briefs/${id}/status`;
                if (userRole === "ADMIN") endpoint = `/briefs/admin/${id}/status`;
                else if (userRole === "EMPLOYEE") endpoint = `/briefs/employee/${id}/status`;
                const response = await api.patch(endpoint, { status: data.status, reason: data.statusReason });
                return response.data;
            }
            const response = await api.patch(`/briefs/${id}`, data);
            return response.data;
        } catch (error: unknown) {
             return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to update brief"));
        }
    }
);

export const deleteBriefThunk = createAsyncThunk(
    "briefs/delete",
    async (id: string, thunkAPI) => {
        try {
            await api.delete(`/briefs/${id}`);
            return id;
        } catch (error: unknown) {
             return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to delete brief"));
        }
    }
);

export const assignBriefThunk = createAsyncThunk(
    "briefs/assign",
    async ({ briefId, employeeIds }: { briefId: string, employeeIds: string[] }, thunkAPI) => {
        try {
            const response = await api.patch(`/briefs/admin/${briefId}/assign`, { employeeIds });
            return response.data;
        } catch (error: unknown) {
             return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to assign brief"));
        }
    }
);
export const fetchEmployeesThunk = createAsyncThunk(
    "briefs/fetchEmployees",
    async (_, thunkAPI) => {
        try {
            const response = await AuthApi.get("/auth/users/role/employee");
            return response.data;
        } catch (error: unknown) {
             return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to fetch employees"));
        }
    }
);

export const fetchTasksThunk = createAsyncThunk(
    "briefs/fetchTasks",
    async (briefId: string, thunkAPI) => {
        try {
            const response = await api.get(`/briefs/${briefId}/tasks`);
            return response.data;
        } catch (error: unknown) {
            return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to fetch tasks"));
        }
    }
);

export const createTaskThunk = createAsyncThunk(
    "briefs/createTask",
    async ({ briefId, ...data }: CreateTaskPayload, thunkAPI) => {
        try {
            const response = await api.post(`/briefs/${briefId}/tasks`, data);
            return response.data;
        } catch (error: unknown) {
            return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to create task"));
        }
    }
);

export const updateTaskThunk = createAsyncThunk(
    "briefs/updateTask",
    async ({ briefId, taskId, data }: UpdateTaskPayload, thunkAPI) => {
        try {
            const response = await api.patch(`/briefs/${briefId}/tasks/${taskId}`, data);
            return response.data;
        } catch (error: unknown) {
            return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to update task"));
        }
    }
);

export const updateTaskStatusThunk = createAsyncThunk(
    "briefs/updateTaskStatus",
    async ({ briefId, taskId, status }: UpdateTaskStatusPayload, thunkAPI) => {
        try {
            const response = await api.patch(`/briefs/${briefId}/tasks/${taskId}/status`, { status });
            return response.data;
        } catch (error: unknown) {
            return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to update task status"));
        }
    }
);

export const deleteTaskThunk = createAsyncThunk(
    "briefs/deleteTask",
    async ({ briefId, taskId }: { briefId: string; taskId: string }, thunkAPI) => {
        try {
            await api.delete(`/briefs/${briefId}/tasks/${taskId}`);
            return taskId;
        } catch (error: unknown) {
            return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to delete task"));
        }
    }
);
