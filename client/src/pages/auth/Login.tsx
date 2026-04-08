import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { loginThunk } from "../../features/auth/authSlice/authThunk";
import { clearError } from "../../features/auth/authSlice/authSlice";
import { selectAuthLoading, selectAuthError } from "../../features/auth/authSlice/authSelectors";
import { getPasswordRules, isPasswordStrong, isEmailValid } from "../../utils/validators";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "", password: "", rememberMe: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    dispatch(clearError());
    if (name === "email" || name === "password") {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const nextErrors = { email: "", password: "" };

    if (!isEmailValid(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!isPasswordStrong(password)) {
      nextErrors.password = "Password format is invalid.";
    }

    const hasError = Object.values(nextErrors).some(Boolean);
    if (hasError) {
      setFieldErrors(nextErrors);
      return;
    }

    const result = await dispatch(loginThunk({ email, password, rememberMe: form.rememberMe }));
    if (loginThunk.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <section className="font-poppins text-white sm:min-h-[calc(100vh-80px)] flex flex-col items-center pt-10 sm:pt-16 pb-10 sm:pb-20 relative overflow-hidden px-4">

      {/* Blobs */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none">
        {/* Drop your blob SVGs/divs here */}
      </div>

      <h1 className="text-white text-3xl sm:text-5xl font-bold tracking-widest uppercase mb-8 z-10 text-center">
        LOG IN
      </h1>

      {/* Server error */}
      {error && (
        <p className="text-red-400 text-sm mb-4 z-10">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-[460px] z-10">
        <input
          name="email" type="email" value={form.email} onChange={handleChange}
          placeholder="Enter your email adresse..." required
          className={`bg-[#2D3652] border rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none transition-colors ${fieldErrors.email ? "border-red-400 focus:border-red-400" : "border-[#2E3A5C] focus:border-[#414CC4]"}`}
        />
        {fieldErrors.email && <p className="text-red-400 text-xs -mt-2">{fieldErrors.email}</p>}

        <div className="relative">
          <input
            name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange}
            placeholder="Enter your Password..." required
            className={`w-full bg-[#2D3652] border rounded-md px-4 py-3 pr-11 text-white placeholder-white/40 text-sm focus:outline-none transition-colors ${fieldErrors.password ? "border-red-400 focus:border-red-400" : "border-[#2E3A5C] focus:border-[#414CC4]"}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {fieldErrors.password && (
          <ul className="-mt-2 flex flex-col gap-0.5">
            {getPasswordRules(form.password).map((rule) => (
              <li key={rule.label} className={`text-xs flex items-center gap-1.5 ${rule.met ? "text-[#00C9B1]" : "text-red-400"}`}>
                <span>{rule.met ? "✓" : "✗"}</span>
                {rule.label}
              </li>
            ))}
          </ul>
        )}

        {/* Remember me */}
        <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
          <input
            name="rememberMe" type="checkbox"
            checked={form.rememberMe} onChange={handleChange}
            className="accent-[#414CC4]"
          />
          Remember me
        </label>

        <button
          type="submit" disabled={loading}
          className="mt-2 bg-[#414CC4] hover:bg-[#3a44b0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-md tracking-widest transition-colors"
        >
          {loading ? "LOGGING IN..." : "LOG IN"}
        </button>

        {/* Forgot password */}
        <div className="text-center">
          <Link to="/forgot-password" className="text-white/40 text-sm hover:text-[#414CC4] transition-colors">
            Forgot password?
          </Link>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#2E3A5C]" />
          <span className="text-white/30 text-xs">OR</span>
          <div className="flex-1 h-px bg-[#2E3A5C]" />
        </div>

        {/* Google */}
        <a
          href={`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/auth/google`}
          className="flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 rounded-md transition-colors text-sm"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Continue with Google
        </a>

        {/* Switch to Register */}
        <p className="text-center text-white/40 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#414CC4] hover:underline font-medium">
            Register
          </Link>
        </p>
      </form>
    </section>
  );
}
