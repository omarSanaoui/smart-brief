import type { RootState } from "../../../app/store";

export const selectAllBriefs = (state: RootState) => state.briefs.briefs;
export const selectCurrentBrief = (state: RootState) => state.briefs.currentBrief;
export const selectBriefsLoading = (state: RootState) => state.briefs.loading;
export const selectBriefsError = (state: RootState) => state.briefs.error;
export const selectEmployees = (state: RootState) => state.briefs.employees;

export const selectBriefById = (state: RootState, briefId: string) =>
    state.briefs.briefs.find(brief => brief.id === briefId);

export const selectTasks = (state: RootState) => state.briefs.tasks;
export const selectTasksLoading = (state: RootState) => state.briefs.tasksLoading;
