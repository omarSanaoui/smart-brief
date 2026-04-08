export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: "ADMIN" | "CLIENT" | "EMPLOYEE";
    provider: "LOCAL" | "GOOGLE";
    createdAt: string;
}

export interface AuthState {
    user: User | null; //loggedin | not logged in
    token: string | null;
    loading: boolean;
    error: string | null;
    initialized: boolean; // true once session restore attempt has completed
}

export interface RegisterPayload {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    rememberMe?: boolean;
}

export interface VerifyCodePayload {
    email: string;
    code: string;
    rememberMe?: boolean;
}

export interface LoginPayload {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface UpdateMePayload {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
}

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export interface DeleteMePayload {
    password?: string;
}
