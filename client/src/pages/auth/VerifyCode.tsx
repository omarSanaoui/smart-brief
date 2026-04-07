import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { verifyCodeThunk } from "../../features/auth/authSlice/authThunk";
import { selectAuthLoading, selectAuthError } from "../../features/auth/authSlice/authSelectors";
import { isEmailValid, isVerificationCodeValid } from "../../utils/validators";

export default function VerifyCode() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const [fieldErrors, setFieldErrors] = useState({ code: "" });

  const email = (location.state as { email?: string; rememberMe?: boolean })?.email || "";
  const rememberMe = (location.state as { email?: string; rememberMe?: boolean })?.rememberMe ?? false;
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) navigate("/register");
    inputs.current[0]?.focus();
  }, [email, navigate]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    setFieldErrors((prev) => ({ ...prev, code: "" }));
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
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
    let codeError = "";

    if (!isEmailValid(cleanEmail)) {
      codeError = "Invalid email address. Please register again.";
      setFieldErrors({ code: codeError });
      return;
    }

    if (!isVerificationCodeValid(code)) {
      codeError = "Please enter a valid 6-digit code.";
      setFieldErrors({ code: codeError });
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
    <section className="font-poppins text-white min-h-[calc(100vh-80px)] flex flex-col items-center pt-16 pb-20 relative overflow-hidden">

      {/* Blobs */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none">
        {/* Drop your blob SVGs/divs here */}
      </div>

      <h1 className="text-white text-[58px] font-bold tracking-widest uppercase mb-[20px] z-10 text-center">
        VERIFY EMAIL
      </h1>

      <p className="text-white/50 text-sm mb-2 z-10">We sent a 6-digit code to</p>
      <p className="text-[#00C9B1] text-sm font-mono mb-10 z-10">{email}</p>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm mb-4 z-10">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 z-10" onPaste={handlePaste}>

        {/* 6 digit inputs */}
        <div className="flex gap-3">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text" inputMode="numeric" maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-12 h-14 text-center text-xl font-bold font-mono rounded-md border bg-[#2D3652] text-white focus:outline-none transition-colors
                ${fieldErrors.code ? "border-red-400 focus:border-red-400" : d ? "border-[#414CC4]" : "border-[#2E3A5C]"}
                ${fieldErrors.code ? "focus:border-red-400" : "focus:border-[#414CC4]"}`}
            />
          ))}
        </div>
        {fieldErrors.code && <p className="text-red-400 text-xs -mt-4">{fieldErrors.code}</p>}

        <button
          type="submit"
          disabled={loading || digits.join("").length < 6}
          className="w-[395px] max-w-[460px] bg-[#414CC4] hover:bg-[#3a44b0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-md tracking-widest transition-colors"
        >
          {loading ? "VERIFYING..." : "VERIFY"}
        </button>

        <p className="text-white/30 text-sm">
          Didn't receive the code?{" "}
          <button type="button" className="text-[#00C9B1] hover:underline">
            Resend
          </button>
        </p>
      </form>
    </section>
  );
}
