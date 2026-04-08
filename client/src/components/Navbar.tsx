import Logo from "../assets/icons/Smart-Brief-logo.svg?react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { selectIsLoggedIn, selectUser } from "../features/auth/authSlice/authSelectors";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../features/auth/authSlice/authSlice";
import { LogOut } from "lucide-react";
import { useMemo, useState } from "react";
import UserProfileModal from "./UserProfileModal";

export default function Navbar() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const isLoggedIn = useAppSelector(selectIsLoggedIn);
    const user = useAppSelector(selectUser);
    const isAdmin = user?.role === "ADMIN";
    const isClient = user?.role === "CLIENT";
    const isEmployee = user?.role === "EMPLOYEE";

    const initials = useMemo(() => {
        const f = user?.firstName?.[0] ?? "";
        const l = user?.lastName?.[0] ?? "";
        return (f + l).toUpperCase() || "U";
    }, [user?.firstName, user?.lastName]);

    function handleLogout() {
        dispatch(logout());
        navigate("/");
    }

    const activeLink = "text-sbteal border-b-2 border-sbteal pb-0.5";
    const inactiveLink = "text-white/80 hover:text-sbteal transition-colors";

    const navLinks = (
        <>
            <NavLink to="/" className={({ isActive }) => isActive ? activeLink : inactiveLink}>Home</NavLink>
            <a href="https://agence47.ma/" className={inactiveLink} target="_blank" rel="noopener noreferrer">Agency</a>
            {isClient && (
                <>
                    <NavLink to="/new-project" className={({ isActive }) => isActive ? activeLink : inactiveLink}>Create Project</NavLink>
                    <NavLink to="/my-briefs" className={({ isActive }) => isActive ? activeLink : inactiveLink}>My Briefs</NavLink>
                </>
            )}
            {isAdmin && (
                <NavLink to="/briefs" className={({ isActive }) => isActive ? activeLink : inactiveLink}>Briefs</NavLink>
            )}
            {isEmployee && (
                <NavLink to="/assigned-briefs" className={({ isActive }) => isActive ? activeLink : inactiveLink}>Assigned Briefs</NavLink>
            )}
        </>
    );

    return (
        <nav className="bg-theme w-full relative z-50">
            <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

            {/* ── Desktop bar ── */}
            <div className="hidden md:flex max-w-300 mx-auto px-6 lg:px-8 py-4 items-center justify-between">
                <Link to="/" className="shrink-0">
                    <Logo className="w-44" />
                </Link>

                <div className="flex items-center gap-7 uppercase font-medium text-white text-[14px] lg:text-[15px]">
                    {navLinks}
                </div>

                <div className="flex items-center gap-3">
                    {!isLoggedIn ? (
                        <>
                            <Link to="/login" className="text-white/80 hover:text-sbteal transition-colors uppercase font-medium text-[14px] tracking-wide">Log In</Link>
                            <Link to="/register" className="bg-sbpurple px-6 py-2 rounded-full hover:bg-[#3a44b0] transition-colors uppercase font-medium text-[14px]">Register</Link>
                        </>
                    ) : (
                        /* Split pill: [avatar + name] | [signout] */
                        <div className="flex items-stretch rounded-full border border-[#2E3A5C] bg-[#2D3652]/40 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setIsProfileOpen(true)}
                                className="flex items-center gap-2.5 pl-2 pr-4 py-2 hover:bg-[#2D3652] transition-colors"
                                aria-label="Open profile"
                            >
                                <div className="h-7 w-7 rounded-full bg-sbpurple/30 border border-sbpurple/50 flex items-center justify-center text-[11px] font-black text-sbteal shrink-0">
                                    {initials}
                                </div>
                                <span className="text-white/90 text-[13px] font-bold tracking-widest uppercase">{user?.firstName}</span>
                            </button>
                            <div className="w-px bg-[#2E3A5C]" />
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex items-center justify-center px-3 hover:bg-sbpurple/20 transition-colors group"
                                aria-label="Sign out"
                                title="Sign out"
                            >
                                <LogOut size={16} className="text-white/50 group-hover:text-white transition-colors" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Mobile bar ── */}
            <div className="md:hidden">
                {/* Row 1: logo left, auth right */}
                <div className="flex items-center justify-between px-4 py-3">
                    <Link to="/" className="shrink-0">
                        <Logo className="w-32" />
                    </Link>

                    <div className="flex items-center gap-2">
                        {!isLoggedIn ? (
                            <>
                                <Link to="/login" className="text-white/80 hover:text-sbteal transition-colors text-xs font-bold uppercase tracking-widest">Log In</Link>
                                <Link to="/register" className="bg-sbpurple hover:bg-[#3a44b0] transition-colors text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">Register</Link>
                            </>
                        ) : (
                            /* Same split pill, compact */
                            <div className="flex items-stretch rounded-full border border-[#2E3A5C] bg-[#2D3652]/40 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setIsProfileOpen(true)}
                                    className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 hover:bg-[#2D3652] transition-colors"
                                    aria-label="Open profile"
                                >
                                    <div className="h-6 w-6 rounded-full bg-sbpurple/30 border border-sbpurple/50 flex items-center justify-center text-[10px] font-black text-sbteal shrink-0">
                                        {initials}
                                    </div>
                                    <span className="text-white/90 text-[11px] font-bold tracking-widest uppercase">{user?.firstName}</span>
                                </button>
                                <div className="w-px bg-[#2E3A5C]" />
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex items-center justify-center px-2.5 hover:bg-sbpurple/20 transition-colors group"
                                    aria-label="Sign out"
                                >
                                    <LogOut size={14} className="text-white/50 group-hover:text-white transition-colors" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Thin border separator */}
                <div className="border-t border-[#2E3A5C]/50" />

                {/* Row 2: nav links centered */}
                <div className="flex items-center justify-center gap-5 px-4 py-2.5 uppercase font-medium text-white text-[12px] flex-wrap">
                    {navLinks}
                </div>
            </div>
        </nav>
    );
}
