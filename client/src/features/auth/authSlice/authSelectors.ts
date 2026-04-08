import type { RootState } from "../../../app/store";

export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsLoggedIn = (state: RootState) => !!state.auth.token;
export const selectIsAdmin = (state: RootState) => state.auth.user?.role === "ADMIN";
export const selectAuthInitialized = (state: RootState) => state.auth.initialized;
