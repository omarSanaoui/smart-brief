const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const NAME_REGEX = /^[A-Za-z][A-Za-z\s'-]{1,39}$/;
const CODE_REGEX = /^\d{6}$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidName(name: string): boolean {
  return NAME_REGEX.test(name.trim());
}

export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  return true;
}

export function isValidPhone(phone: string): boolean {
  const normalized = phone.replace(/\D/g, "");
  return normalized.length >= 9 && normalized.length <= 15;
}

export function isValidVerificationCode(code: string): boolean {
  return CODE_REGEX.test(code.trim());
}