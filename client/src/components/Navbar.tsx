import Logo from "../assets/icons/Smart-Brief-logo.svg?react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { selectIsLoggedIn, selectUser } from "../features/auth/authSlice/authSelectors";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../features/auth/authSlice/authSlice";

export default function Navbar() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const isLoggedIn = useAppSelector(selectIsLoggedIn);
    const user = useAppSelector(selectUser);
    const isAdmin = user?.role === "ADMIN";
    const isClient = user?.role === "CLIENT";
    const isEmployee = user?.role === "EMPLOYEE";

    function handleLogout() {
        dispatch(logout());
        navigate("/");
    }
    return (
        <nav className="bg-theme w-full">
            <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
                <Link to="/">
                    <Logo className="w-46" />
                </Link>
                <div className="flex items-center space-x-8 uppercase font-medium text-white text-[18px]">
                    <NavLink to="/" className={({ isActive }) => isActive ? 'text-sbteal border-b-2 border-sbteal pb-0.5' : 'text-white hover:text-sbteal transition-colors'}>Home</NavLink>
                    <a href="https://agence47.ma/" className='hover:text-sbteal transition-colors' target="_blank" rel="noopener noreferrer">Agency</a>
                    {isClient &&
                        <>
                            <NavLink to="/new-project" className={({ isActive }) => isActive ? 'text-sbteal border-b-2 border-sbteal pb-0.5' : 'hover:text-sbteal transition-colors'}>Create Project</NavLink>
                            <NavLink to="/my-briefs" className={({ isActive }) => isActive ? 'text-sbteal border-b-2 border-sbteal pb-0.5' : 'hover:text-sbteal transition-colors'}>My Briefs</NavLink>
                        </>
                    }
                    {isAdmin &&
                        <NavLink to="/briefs" className={({ isActive }) => isActive ? 'text-sbteal border-b-2 border-sbteal pb-0.5' : 'hover:text-sbteal transition-colors'}>Briefs</NavLink>
                    }
                    {isEmployee &&
                        <NavLink to="/assigned-briefs" className={({ isActive }) => isActive ? 'text-sbteal border-b-2 border-sbteal pb-0.5' : 'hover:text-sbteal transition-colors'}>Assigned Briefs</NavLink>
                    }

                    {!isLoggedIn &&
                        <>
                            <Link to="/login" className='hover:text-sbteal transition-colors'>Log In</Link>
                            <Link to="/register" className="bg-sbpurple px-6 py-2 rounded-full hover:bg-[#3a44b0]  transition-colors">Register</Link>
                        </>
                    }
                    {isLoggedIn &&
                        <button onClick={handleLogout} className="bg-sbpurple px-6 py-2 rounded-full hover:bg-[#3a44b0]  transition-colors">Sign out</button>
                    }
                </div>
            </div>
        </nav>
    )
}