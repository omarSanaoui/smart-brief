import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { registerThunk } from "../../features/auth/authSlice/authThunk";
import { clearError } from "../../features/auth/authSlice/authSlice";
import { selectAuthLoading, selectAuthError } from "../../features/auth/authSlice/authSelectors";
import { PhoneInput } from "../../components/PhoneInput";
import { getPasswordRules, isEmailValid, isNameValid, isPasswordStrong, isPhoneValid } from "../../utils/validators";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "",
    email: "", password: "", confirmPassword: "", rememberMe: false,
  });
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "", lastName: "", phone: "", email: "", password: "", confirmPassword: "",
  });

  const validationFields = ["firstName", "lastName", "phone", "email", "password", "confirmPassword"] as const;

  function isValidationField(name: string): name is (typeof validationFields)[number] {
    return (validationFields as readonly string[]).includes(name);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    dispatch(clearError());
    if (isValidationField(name)) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (name === "password") {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const phone = form.phone.trim();
    const nextErrors = { firstName: "", lastName: "", phone: "", email: "", password: "", confirmPassword: "" };

    if (!isNameValid(firstName)) nextErrors.firstName = t("auth.register.errors.firstName");
    if (!isNameValid(lastName)) nextErrors.lastName = t("auth.register.errors.lastName");
    if (!isEmailValid(email)) nextErrors.email = t("auth.register.errors.invalidEmail");
    if (!isPasswordStrong(password)) nextErrors.password = t("auth.register.errors.invalidPassword");
    if (phone && !isPhoneValid(phone)) nextErrors.phone = t("auth.register.errors.invalidPhone");
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = t("auth.register.errors.passwordMismatch");

    const hasError = Object.values(nextErrors).some(Boolean);
    if (hasError) { setFieldErrors(nextErrors); return; }

    const result = await dispatch(registerThunk({ firstName, lastName, email, password, phone: phone || undefined }));
    if (registerThunk.fulfilled.match(result)) {
      navigate("/verify-code", { state: { email, rememberMe: form.rememberMe } });
    }
  };

  return (
    <section className="font-poppins text-white sm:min-h-[calc(100vh-80px)] flex flex-col items-center pt-10 sm:pt-16 pb-10 sm:pb-20 relative overflow-hidden px-4">
      <h1 className="text-white text-3xl sm:text-5xl font-bold tracking-widest uppercase mb-8 z-10 text-center">
        {t("auth.register.title")}
      </h1>

      {error && <p className="text-red-400 text-sm mb-4 z-10">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-[460px] z-10">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/2">
            <input
              name="firstName" value={form.firstName} onChange={handleChange}
              placeholder={t("auth.register.firstNamePlaceholder")} required
              className={`w-full bg-[#2D3652] border rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none transition-colors ${fieldErrors.firstName ? "border-red-400 focus:border-red-400" : "border-[#2E3A5C] focus:border-sbpurple"}`}
            />
            {fieldErrors.firstName && <p className="text-red-400 text-xs mt-1">{fieldErrors.firstName}</p>}
          </div>
          <div className="w-full sm:w-1/2">
            <input
              name="lastName" value={form.lastName} onChange={handleChange}
              placeholder={t("auth.register.lastNamePlaceholder")} required
              className={`w-full bg-[#2D3652] border rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none transition-colors ${fieldErrors.lastName ? "border-red-400 focus:border-red-400" : "border-[#2E3A5C] focus:border-sbpurple"}`}
            />
            {fieldErrors.lastName && <p className="text-red-400 text-xs mt-1">{fieldErrors.lastName}</p>}
          </div>
        </div>

        <div>
          <div className={`phone-dark flex rounded-md transition-colors ${fieldErrors.phone ? "ring-1 ring-red-400" : "focus-within:ring-1 focus-within:ring-sbpurple"}`}>
            <PhoneInput
              placeholder={t("auth.register.phonePlaceholder")}
              value={form.phone}
              onChange={(val) => {
                setForm((prev) => ({ ...prev, phone: val }));
                setFieldErrors((prev) => ({ ...prev, phone: "" }));
                dispatch(clearError());
              }}
              defaultCountry="MA"
              className="w-full"
            />
          </div>
          {fieldErrors.phone && <p className="text-red-400 text-xs mt-1">{fieldErrors.phone}</p>}
        </div>

        <input
          name="email" type="email" value={form.email} onChange={handleChange}
          placeholder={t("auth.register.emailPlaceholder")} required
          className={`bg-[#2D3652] border rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none transition-colors ${fieldErrors.email ? "border-red-400 focus:border-red-400" : "border-[#2E3A5C] focus:border-sbpurple"}`}
        />
        {fieldErrors.email && <p className="text-red-400 text-xs -mt-2">{fieldErrors.email}</p>}

        <div className="relative">
          <input
            name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange}
            placeholder={t("auth.register.passwordPlaceholder")} required
            className={`w-full bg-[#2D3652] border rounded-md px-4 py-3 pr-11 text-white placeholder-white/40 text-sm focus:outline-none transition-colors ${fieldErrors.password ? "border-red-400 focus:border-red-400" : "border-[#2E3A5C] focus:border-sbpurple"}`}
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {form.password && (
          <ul className="-mt-2 flex flex-col gap-0.5">
            {getPasswordRules(form.password).map((rule) => (
              <li key={rule.label} className={`text-xs flex items-center gap-1.5 ${rule.met ? "text-[#00C9B1]" : "text-red-400"}`}>
                <span>{rule.met ? "✓" : "✗"}</span>
                {rule.label}
              </li>
            ))}
          </ul>
        )}

        <div className="relative">
          <input
            name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={handleChange}
            placeholder={t("auth.register.confirmPasswordPlaceholder")} required
            className={`w-full bg-[#2D3652] border rounded-md px-4 py-3 pr-11 text-white placeholder-white/40 text-sm focus:outline-none transition-colors ${fieldErrors.confirmPassword ? "border-red-400 focus:border-red-400" : "border-[#2E3A5C] focus:border-sbpurple"}`}
          />
          <button type="button" onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            tabIndex={-1} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {fieldErrors.confirmPassword && <p className="text-red-400 text-xs -mt-2">{fieldErrors.confirmPassword}</p>}

        <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
          <input name="rememberMe" type="checkbox" checked={form.rememberMe} onChange={handleChange} className="accent-sbpurple" />
          {t("auth.register.rememberMe")}
        </label>

        <button type="submit" disabled={loading}
          className="mt-2 bg-sbpurple hover:bg-[#3a44b0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-md tracking-widest transition-colors">
          {loading ? t("auth.register.submitting") : t("auth.register.submit")}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#2E3A5C]" />
          <span className="text-white/30 text-xs">{t("auth.register.or")}</span>
          <div className="flex-1 h-px bg-[#2E3A5C]" />
        </div>

        <a href={`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/auth/google`}
          className="flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 rounded-md transition-colors text-sm">
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          {t("auth.register.continueGoogle")}
        </a>

        <p className="text-center text-white/40 text-sm">
          {t("auth.register.hasAccount")}{" "}
          <Link to="/login" className="text-sbpurple hover:underline font-medium">
            {t("auth.register.loginLink")}
          </Link>
        </p>
      </form>
    </section>
  );
}
