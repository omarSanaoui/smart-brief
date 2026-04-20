import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../features/auth/api/authAxios";
import axios from "axios";
import { getPasswordRules, isPasswordStrong } from "../../utils/validators";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ResetPassword() {
  const { token = "" } = useParams<{ token: string }>();
  const { t } = useTranslation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError("");
    setServerError("");

    if (!token) { setFieldError(t("auth.resetPassword.errors.invalidLink")); return; }
    if (!isPasswordStrong(password)) { setFieldError(t("auth.resetPassword.errors.invalidPassword")); return; }
    if (password !== confirmPassword) { setFieldError(t("auth.resetPassword.errors.passwordMismatch")); return; }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      setSubmitted(true);
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { message?: string })?.message || t("auth.resetPassword.errors.resetFailed"))
        : t("auth.resetPassword.errors.resetFailed");
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="font-poppins text-white sm:min-h-[calc(100vh-80px)] flex flex-col items-center pt-10 sm:pt-16 pb-10 sm:pb-20 relative overflow-hidden px-4">
      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none" />

      <h1 className="text-white text-3xl sm:text-5xl font-bold tracking-widest uppercase mb-6 z-10 text-center">
        {t("auth.resetPassword.title")}
      </h1>

      {submitted ? (
        <div className="z-10 flex flex-col items-center gap-4 text-center max-w-[380px]">
          <p className="text-white text-lg font-semibold">{t("auth.resetPassword.successTitle")}</p>
          <p className="text-white/50 text-sm">{t("auth.resetPassword.successSubtitle")}</p>
          <Link to="/login" className="mt-2 bg-[#414CC4] hover:bg-[#3a44b0] text-white font-bold py-3 px-8 rounded-md tracking-widest transition-colors">
            {t("auth.resetPassword.goToLogin")}
          </Link>
        </div>
      ) : (
        <>
          <p className="text-white/50 text-sm mb-10 z-10 text-center max-w-[460px]">
            {t("auth.resetPassword.subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-[460px] z-10">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldError(""); setServerError(""); }}
                placeholder={t("auth.resetPassword.newPasswordPlaceholder")} required
                className={`w-full bg-[#2D3652] border rounded-md px-4 py-3 pr-11 text-white placeholder-white/40 text-sm focus:outline-none transition-colors ${fieldError ? "border-red-400 focus:border-red-400" : "border-[#2E3A5C] focus:border-[#414CC4]"}`}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {password && (
              <ul className="-mt-2 flex flex-col gap-0.5">
                {getPasswordRules(password).map((rule) => (
                  <li key={rule.label} className={`text-xs flex items-center gap-1.5 ${rule.met ? "text-[#00C9B1]" : "text-red-400"}`}>
                    <span>{rule.met ? "✓" : "✗"}</span>
                    {rule.label}
                  </li>
                ))}
              </ul>
            )}

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"} value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setFieldError(""); setServerError(""); }}
                placeholder={t("auth.resetPassword.confirmPasswordPlaceholder")} required
                className={`w-full bg-[#2D3652] border rounded-md px-4 py-3 pr-11 text-white placeholder-white/40 text-sm focus:outline-none transition-colors ${fieldError ? "border-red-400 focus:border-red-400" : "border-[#2E3A5C] focus:border-[#414CC4]"}`}
              />
              <button type="button" onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                tabIndex={-1} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {fieldError && <p className="text-red-400 text-xs -mt-2">{fieldError}</p>}
            {serverError && <p className="text-red-400 text-xs -mt-2">{serverError}</p>}

            <button type="submit" disabled={loading}
              className="mt-2 bg-[#414CC4] hover:bg-[#3a44b0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-md tracking-widest transition-colors">
              {loading ? t("auth.resetPassword.submitting") : t("auth.resetPassword.submit")}
            </button>

            <p className="text-center text-white/40 text-sm">
              {t("auth.resetPassword.rememberedIt")}{" "}
              <Link to="/login" className="text-[#414CC4] hover:underline font-medium">
                {t("auth.resetPassword.backToLogin")}
              </Link>
            </p>
          </form>
        </>
      )}
    </section>
  );
}
