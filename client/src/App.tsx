import { Route, Routes, useLocation, useSearchParams } from "react-router-dom";
import AbstractObj1 from "./assets/icons/abstract objects.svg?react";
import AbstractObj2 from "./assets/icons/abstract objects2.svg?react";
import Navbar from "./components/Navbar"
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Register from "./pages/auth/Register";
import { useEffect } from "react";
import { setToken } from "./features/auth/authSlice/authSlice";
import { getMeThunk } from "./features/auth/authSlice/authThunk";
import { selectIsLoggedIn, selectToken, selectUser } from "./features/auth/authSlice/authSelectors";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import VerifyCode from "./pages/auth/VerifyCode";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Landing from "./pages/Landing";
import NewProject from "./pages/client/NewProject";
import MyBriefs from "./pages/client/MyBriefs";
import BriefsDashboard from "./pages/shared/BriefsDashboard";
import BriefDetails from "./pages/shared/BriefDetails";
import AdminNewProject from "./pages/admin/AdminNewProject";
import VerifyEmailChange from "./pages/auth/VerifyEmailChange";

export default function SmarBriefApp() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const token = useAppSelector(selectToken)
  const user = useAppSelector(selectUser)
  const isLoggedIn = useAppSelector(selectIsLoggedIn);


  const authPaths = ['/register', '/login', '/verify-code', '/forgot-password', '/reset-password'];
  const isAuthPage = authPaths.includes(location.pathname);

  // Handle Google OAuth redirect: /?token=XXX
  useEffect(() => {
    const googleToken = searchParams.get('token')
    if (googleToken) {
      localStorage.setItem('token', googleToken)
      dispatch(setToken(googleToken))
      const next = new URLSearchParams(searchParams.toString())
      next.delete('token')
      setSearchParams(next, { replace: true })
    }
  }, [dispatch, searchParams, setSearchParams])

  // Restore user session on refresh
  useEffect(() => {
    if (token && !user) {
      dispatch(getMeThunk())
    }
  }, [dispatch, token, user])

  const backgroundAbstract = isAuthPage ? (
    <AbstractObj2 className="absolute top-[35vh] sm:top-56 lg:top-80 right-[-180px] sm:right-[-280px] lg:right-[-466px] w-[420px] sm:w-[800px] lg:w-[1600px] opacity-90" />
  ) : (
    <AbstractObj1 className="absolute top-[35vh] sm:top-32 lg:top-40 right-[-180px] sm:right-[-280px] lg:right-[-466px] w-[420px] sm:w-[800px] lg:w-[1600px] opacity-90" />
  )

  return (
    <div className="relative isolate min-h-screen bg-theme overflow-x-hidden font-poppins text-white" >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden hidden sm:block" aria-hidden="true">
        {backgroundAbstract}
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">
        <Routes>
          {isLoggedIn ? (
            <Route path="/" element={<Home />} />
          ) : (
            <Route path="/" element={<Landing />} />
          )}
          <Route path="/new-project" element={<NewProject />} />
          <Route path="/my-briefs" element={<MyBriefs />} />
          <Route path="/briefs" element={<BriefsDashboard />} />
          <Route path="/assigned-briefs" element={<BriefsDashboard />} />
          <Route path="/briefs/:id" element={<BriefDetails />} />
          <Route path="/admin/new-project" element={<AdminNewProject />} />
          <Route path="/verify-email-change/:token" element={<VerifyEmailChange />} />
          <Route path="/register" element={<Register />} />
          <Route path='/verify-code' element={<VerifyCode />} />
          <Route path='/login' element={<Login />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password/:token' element={<ResetPassword />} />
        </Routes>
        </div>
        <Footer />
      </div>
    </div>
  )
}
