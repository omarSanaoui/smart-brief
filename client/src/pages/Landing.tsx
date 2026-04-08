import { useNavigate } from "react-router-dom"
import { useAppSelector } from "../app/hooks"
import { selectIsLoggedIn } from "../features/auth/authSlice/authSelectors"

export default function Landing() {
  const navigate = useNavigate()
  const isLoggedIn = useAppSelector(selectIsLoggedIn)

  function handleGetStarted() {
    navigate(isLoggedIn ? "/" : "/register");
  }

  return (
    <section className="relative max-w-300 mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 sm:py-0 sm:min-h-[calc(100vh-80px)] flex items-center">
      <div className="w-full">
        <h1 className="font-bold text-4xl sm:text-6xl lg:text-7xl leading-tight sm:leading-[1.05] mb-8 sm:mb-12 [text-shadow:0_4px_20px_rgba(0,0,0,0.45),0_1px_2px_rgba(0,0,0,0.6)]">
          YOUR <span className="text-sbteal">VISION,</span> ARCHITECTED.
        </h1>
        <p className="text-base sm:text-xl lg:text-2xl text-[#D6D6D6] w-full max-w-2xl mb-8 sm:mb-12 [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]">
          A streamlined discovery portal for Agence47 partners. Define your scope, select your stack, and bridge the gap
          between idea and execution in minutes.
        </p>
        <button onClick={handleGetStarted} className="bg-sbpurple font-medium text-base sm:text-lg px-7 py-3 rounded-full">
          GET STARTED
        </button>
      </div>
    </section>
  )
} 
