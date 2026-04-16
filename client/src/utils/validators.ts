const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const NAME_REGEX = /^[A-Za-z][A-Za-z\s'-]{1,39}$/;
const CODE_REGEX = /^\d{6}$/;

export function isEmailValid(email: string): boolean {
    return EMAIL_REGEX.test(email.trim());
}
export function isNameValid(name: string): boolean {
    return NAME_REGEX.test(name.trim());
}
export function isVerificationCodeValid(code: string): boolean {
    return CODE_REGEX.test(code.trim());
}
export function isPhoneValid(phone: string): boolean {
    const normalized = phone.replace(/\D/g, "");
    return normalized.length >= 9 && normalized.length <= 15;
}


export function isPasswordStrong(password: string): boolean {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/\d/.test(password)) return false;
    return true;
}

export interface PasswordRule {
    label: string;
    met: boolean;
}

export function getPasswordRules(password: string): PasswordRule[] {
    return [
        { label: "At least 8 characters", met: password.length >= 8 },
        { label: "One uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
        { label: "One lowercase letter (a-z)", met: /[a-z]/.test(password) },
        { label: "One number (0-9)", met: /\d/.test(password) },
    ]
}
