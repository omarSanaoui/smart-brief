import { createSlice } from "@reduxjs/toolkit";
import type { BriefState } from "./briefTypes";
import { 
    fetchBriefsThunk, 
    fetchBriefByIdThunk, 
    createBriefThunk, 
    updateBriefThunk, 
    deleteBriefThunk,
    assignBriefThunk,
    fetchEmployeesThunk
} from "./briefThunk";

const initialState: BriefState = {
    briefs: [],
    currentBrief: null,
    employees: [],
    loading: false,
    error: null
};

const briefSlice = createSlice({
    name: "briefs",
    initialState,
    reducers: {
        clearBriefError: (state) => { state.error = null },
        clearCurrentBrief: (state) => { state.currentBrief = null }
    },
    extraReducers(builder) {
        builder
            // Fetch All
            .addCase(fetchBriefsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBriefsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.briefs = action.payload; 
            })
            .addCase(fetchBriefsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            
            // Fetch By ID
            .addCase(fetchBriefByIdThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBriefByIdThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.currentBrief = action.payload;
            })
            .addCase(fetchBriefByIdThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Create Brief
            .addCase(createBriefThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBriefThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.briefs.push(action.payload);
            })
            .addCase(createBriefThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Update Brief
            .addCase(updateBriefThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBriefThunk.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.briefs.findIndex(b => b.id === action.payload.id);
                if (index !== -1) {
                    state.briefs[index] = action.payload;
                }
                if (state.currentBrief?.id === action.payload.id) {
                    state.currentBrief = action.payload;
                }
            })
            .addCase(updateBriefThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Delete Brief
            .addCase(deleteBriefThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBriefThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.briefs = state.briefs.filter(b => b.id !== action.payload);
                if (state.currentBrief?.id === action.payload) {
                    state.currentBrief = null;
                }
            })
            .addCase(deleteBriefThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Assign Brief
            .addCase(assignBriefThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(assignBriefThunk.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.briefs.findIndex(b => b.id === action.payload.id);
                if (index !== -1) {
                    state.briefs[index] = action.payload;
                }
                if (state.currentBrief?.id === action.payload.id) {
                    state.currentBrief = action.payload;
                }
            })
            .addCase(assignBriefThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch Employees
            .addCase(fetchEmployeesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployeesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.employees = action.payload;
            })
            .addCase(fetchEmployeesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { clearBriefError, clearCurrentBrief } = briefSlice.actions;
export default briefSlice.reducer;
