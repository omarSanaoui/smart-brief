import { useNavigate } from "react-router-dom"
import { useAppSelector } from "../app/hooks"
import { selectIsLoggedIn } from "../features/auth/authSlice/authSelectors"

export default function Landing() {
  const navigate = useNavigate()
  const isLoggedIn = useAppSelector(selectIsLoggedIn)

  function handleGetStarted() {
    navigate(isLoggedIn ? "/home" : "/register");
  }

  return (
    <section className="relative max-w-300 mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between min-h-[calc(100vh-80px)]">
      <div>
        <h1 className="font-bold text-[96px] leading-[87px] mb-[56px] [text-shadow:0_4px_20px_rgba(0,0,0,0.45),0_1px_2px_rgba(0,0,0,0.6)]">
          YOUR <span className="text-sbteal">VISION,</span> ARCHITECTED.
        </h1>
        <p className="text-[26px] text-[#D6D6D6] w-full max-w-[711px] mb-[55px] [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]">
          A streamlined discovery portal for Agence47 partners. Define your scope,
          select your stack, and bridge the gap between idea and execution in minutes.
        </p>
        <button onClick={handleGetStarted} className="bg-sbpurple font-medium text-[18px] px-6 py-2 rounded-full">
          GET STARTED
        </button>
      </div>
    </section>
  )
} 