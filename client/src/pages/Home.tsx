import { useNavigate } from "react-router-dom"
import { useAppSelector } from "../app/hooks"
import { selectUser } from "../features/auth/authSlice/authSelectors"

export default function Home() {
    const navigate = useNavigate()
    const user = useAppSelector(selectUser);
    const isAdmin = user?.role === "ADMIN";
    const isClient = user?.role === "CLIENT";
    const isEmployee = user?.role === "EMPLOYEE";
    function handleCreateProject() {
        navigate("/new-project");
    }
    function handleCheckMyBriefs() {
        navigate("/my-briefs");
    }
    function handleCheckBriefs() {
        navigate("/briefs");
    }
    function handleCheckAssignedBriefs() {
        navigate("/assigned-briefs");
    }

    return (
        <section className="relative max-w-300 mx-auto px-4 sm:px-6 lg:px-8 py-0 min-h-[calc(100vh-80px)] flex items-center justify-center sm:justify-start">
            <div className="w-full text-center sm:text-left">
                <h1 className="font-bold text-4xl sm:text-6xl lg:text-7xl leading-tight sm:leading-[1.05] mb-6 sm:mb-12 [text-shadow:0_4px_20px_rgba(0,0,0,0.45),0_1px_2px_rgba(0,0,0,0.6)]">
                    Welcome Back{" "}
                    <span className="block text-sbteal">{user?.firstName}</span>
                </h1>
                {isClient && (
                    <div className="flex flex-row justify-center sm:justify-start gap-3 sm:gap-5 font-medium text-sm sm:text-base">
                        <button onClick={handleCreateProject} className="bg-sbpurple px-5 sm:px-7 py-2.5 rounded-full">
                            Create a Project
                        </button>
                        <button onClick={handleCheckMyBriefs} className="bg-transparent border-2 border-sbpurple px-5 sm:px-7 py-2.5 rounded-full">
                            Check My Briefs
                        </button>
                    </div>
                )}
                {isAdmin && (
                    <div className="flex flex-row justify-center sm:justify-start gap-3 sm:gap-5 font-medium text-sm sm:text-base">
                        <button onClick={handleCheckBriefs} className="bg-sbpurple px-5 sm:px-7 py-2.5 rounded-full">
                            Check Briefs
                        </button>
                    </div>
                )}
                {isEmployee && (
                    <div className="flex flex-row justify-center sm:justify-start gap-3 sm:gap-5 font-medium text-sm sm:text-base">
                        <button onClick={handleCheckAssignedBriefs} className="bg-sbpurple px-5 sm:px-7 py-2.5 rounded-full">
                            Check Assigned Briefs
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}
