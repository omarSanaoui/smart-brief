import { useState } from "react";
import { Link } from "react-router-dom";
import { isEmailValid } from "../../utils/validators";
import api from "../../features/auth/api/authAxios";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    setServerError("");

    if (!isEmailValid(clean)) {
      setFieldError(t("auth.forgotPassword.errors.invalidEmail"));
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: clean });
      setSubmitted(true);
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { message?: string })?.message || t("auth.forgotPassword.errors.sendFailed"))
        : t("auth.forgotPassword.errors.sendFailed");
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="font-poppins text-white sm:min-h-[calc(100vh-80px)] flex flex-col items-center pt-10 sm:pt-16 pb-10 sm:pb-20 relative overflow-hidden px-4">
      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none" />

      <h1 className="text-white text-3xl sm:text-5xl font-bold tracking-widest uppercase mb-6 z-10 text-center">
        {t("auth.forgotPassword.title")}
      </h1>

      {!submitted ? (
        <>
          <p className="text-white/50 text-sm mb-10 z-10 text-center max-w-[460px]">
            {t("auth.forgotPassword.subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-[460px] z-10">
            <input
              type="email" value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldError(""); setServerError(""); }}
              placeholder={t("auth.forgotPassword.emailPlaceholder")} required
              className={`bg-[#2D3652] border rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none transition-colors ${fieldError ? "border-red-400 focus:border-red-400" : "border-[#2E3A5C] focus:border-[#414CC4]"}`}
            />
            {fieldError && <p className="text-red-400 text-xs -mt-2">{fieldError}</p>}
            {serverError && <p className="text-red-400 text-xs -mt-2">{serverError}</p>}

            <button type="submit" disabled={loading}
              className="mt-2 bg-[#414CC4] hover:bg-[#3a44b0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-md tracking-widest transition-colors">
              {loading ? t("auth.forgotPassword.submitting") : t("auth.forgotPassword.submit")}
            </button>

            <p className="text-center text-white/40 text-sm">
              {t("auth.forgotPassword.rememberedIt")}{" "}
              <Link to="/login" className="text-[#414CC4] hover:underline font-medium">
                {t("auth.forgotPassword.backToLogin")}
              </Link>
            </p>
          </form>
        </>
      ) : (
        <div className="z-10 flex flex-col items-center gap-4 text-center max-w-[380px]">
          <div className="text-5xl">📧</div>
          <p className="text-white text-lg font-semibold">{t("auth.forgotPassword.checkInbox")}</p>
          <p className="text-white/50 text-sm">
            {t("auth.forgotPassword.emailSent", { email })}
          </p>
          <Link to="/login" className="mt-4 text-[#414CC4] hover:underline text-sm">
            {t("auth.forgotPassword.backToLogin")}
          </Link>
        </div>
      )}
    </section>
  );
}
