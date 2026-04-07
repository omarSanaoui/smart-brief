import { useState } from "react";
import { Link } from "react-router-dom";
import { isEmailValid } from "../../utils/validators";
import api from "../../features/auth/api/authAxios";
import axios from "axios";

export default function ForgotPassword() {
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
      setFieldError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: clean });
      setSubmitted(true);
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { message?: string })?.message || "Failed to send reset email. Please try again.")
        : "Failed to send reset email. Please try again.";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="font-poppins text-white min-h-[calc(100vh-80px)] flex flex-col items-center pt-16 pb-20 relative overflow-hidden">
      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none" />

      <h1 className="text-white text-[58px] font-bold tracking-widest uppercase mb-[20px] z-10 text-center">
        FORGOT PASSWORD
      </h1>

      {!submitted ? (
        <>
          <p className="text-white/50 text-sm mb-10 z-10 text-center max-w-[395px]">
            Enter your email and we'll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-[395px] max-w-[460px] z-10">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldError(""); setServerError(""); }}
              placeholder="Enter your email address..."
              required
              className={`bg-[#2D3652] border rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none transition-colors ${fieldError ? "border-red-400 focus:border-red-400" : "border-[#2E3A5C] focus:border-[#414CC4]"}`}
            />
            {fieldError && <p className="text-red-400 text-xs -mt-2">{fieldError}</p>}
            {serverError && <p className="text-red-400 text-xs -mt-2">{serverError}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-[#414CC4] hover:bg-[#3a44b0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-md tracking-widest transition-colors"
            >
              {loading ? "SENDING..." : "SEND RESET LINK"}
            </button>

            <p className="text-center text-white/40 text-sm">
              Remembered it?{" "}
              <Link to="/login" className="text-[#414CC4] hover:underline font-medium">
                Back to Log in
              </Link>
            </p>
          </form>
        </>
      ) : (
        <div className="z-10 flex flex-col items-center gap-4 text-center max-w-[380px]">
          <div className="text-5xl">📧</div>
          <p className="text-white text-lg font-semibold">Check your inbox</p>
          <p className="text-white/50 text-sm">
            If <span className="text-[#00C9B1] font-mono">{email}</span> is registered, you'll receive a reset link shortly.
          </p>
          <Link to="/login" className="mt-4 text-[#414CC4] hover:underline text-sm">
            Back to Log in
          </Link>
        </div>
      )}
    </section>
  );
}
