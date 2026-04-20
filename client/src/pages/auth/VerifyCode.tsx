import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { verifyCodeThunk, resendCodeThunk } from "../../features/auth/authSlice/authThunk";
import { selectAuthLoading, selectAuthError } from "../../features/auth/authSlice/authSelectors";
import { isEmailValid, isVerificationCodeValid } from "../../utils/validators";
import { useTranslation } from "react-i18next";

export default function VerifyCode() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const [fieldErrors, setFieldErrors] = useState({ code: "" });
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const email = (location.state as { email?: string; rememberMe?: boolean })?.email || "";
  const rememberMe = (location.state as { email?: string; rememberMe?: boolean })?.rememberMe ?? false;
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) navigate("/register");
    inputs.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || resendStatus === "sending") return;
    setResendStatus("sending");
    const result = await dispatch(resendCodeThunk(email));
    if (resendCodeThunk.fulfilled.match(result)) {
      setResendStatus("sent");
      setResendCooldown(60);
    } else {
      setResendStatus("error");
    }
  };

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    setFieldErrors((prev) => ({ ...prev, code: "" }));
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      setFieldErrors((prev) => ({ ...prev, code: "" }));
      inputs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const code = digits.join("");

    if (!isEmailValid(cleanEmail)) {
      setFieldErrors({ code: t("auth.verify.errors.invalidEmail") });
      return;
    }
    if (!isVerificationCodeValid(code)) {
      setFieldErrors({ code: t("auth.verify.errors.invalidCode") });
      return;
    }

    const result = await dispatch(verifyCodeThunk({ email: cleanEmail, code, rememberMe }));
    if (verifyCodeThunk.fulfilled.match(result)) {
      navigate("/");
    } else {
      setDigits(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    }
  };

  return (
    <section className="font-poppins text-white sm:min-h-[calc(100vh-80px)] flex flex-col items-center pt-10 sm:pt-16 pb-10 sm:pb-20 relative overflow-hidden px-4">
      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none" />

      <h1 className="text-white text-3xl sm:text-5xl font-bold tracking-widest uppercase mb-6 z-10 text-center">
        {t("auth.verify.title")}
      </h1>

      <p className="text-white/50 text-sm mb-2 z-10">{t("auth.verify.sentCode")}</p>
      <p className="text-[#00C9B1] text-sm font-mono mb-10 z-10">{email}</p>

      {error && <p className="text-red-400 text-sm mb-4 z-10">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 z-10 w-full" onPaste={handlePaste}>
        <div className="flex gap-2 sm:gap-3 justify-center w-full">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text" inputMode="numeric" maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-md border bg-[#2D3652] text-white focus:outline-none transition-colors
                ${fieldErrors.code ? "border-red-400 focus:border-red-400" : d ? "border-[#414CC4]" : "border-[#2E3A5C]"}
                ${fieldErrors.code ? "focus:border-red-400" : "focus:border-[#414CC4]"}`}
            />
          ))}
        </div>
        {fieldErrors.code && <p className="text-red-400 text-xs -mt-4">{fieldErrors.code}</p>}

        <button type="submit" disabled={loading || digits.join("").length < 6}
          className="w-full max-w-[460px] bg-[#414CC4] hover:bg-[#3a44b0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-md tracking-widest transition-colors">
          {loading ? t("auth.verify.submitting") : t("auth.verify.submit")}
        </button>

        <p className="text-white/30 text-sm text-center">
          {t("auth.verify.noCode")}{" "}
          <button type="button" onClick={handleResend}
            disabled={resendCooldown > 0 || resendStatus === "sending"}
            className="text-[#00C9B1] hover:underline disabled:opacity-40 disabled:cursor-not-allowed">
            {resendStatus === "sending"
              ? t("auth.verify.resending")
              : resendCooldown > 0
              ? t("auth.verify.resendIn", { count: resendCooldown })
              : t("auth.verify.resend")}
          </button>
          {resendStatus === "sent" && resendCooldown > 0 && (
            <span className="ml-2 text-[#00C9B1] text-xs">{t("auth.verify.codeSent")}</span>
          )}
          {resendStatus === "error" && (
            <span className="ml-2 text-red-400 text-xs">{t("auth.verify.resendFailed")}</span>
          )}
        </p>
      </form>
    </section>
  );
}
