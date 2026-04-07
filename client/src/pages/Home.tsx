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
        <section className="relative max-w-300 mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between min-h-[calc(100vh-80px)]">
            <div className="absolute top-40 right-[-466px] w-[1600px]">
                <h1 className="font-bold text-[102px] leading-[87px] mb-[88px] [text-shadow:0_4px_20px_rgba(0,0,0,0.45),0_1px_2px_rgba(0,0,0,0.6)]">
                    Welcome Back <br /><span className="text-sbteal">{user?.firstName}</span>
                </h1>
                {isClient &&
                    <div className="flex gap-7 font-medium text-[20px]">
                        <button onClick={handleCreateProject} className="bg-sbpurple px-8 py-2 rounded-full">
                            Create a Project
                        </button>
                        <button onClick={handleCheckMyBriefs} className="bg-transparent border-2 border-sbpurple px-6 py-2 rounded-full">
                            Check My Briefs
                        </button>
                    </div>
                }
                {isAdmin &&
                    <div className="flex gap-7 font-medium text-[20px]">
                        <button onClick={handleCheckBriefs} className="bg-sbpurple font-medium text-[18px] px-6 py-2 rounded-full">
                            Check Briefs
                        </button>
                    </div>
                }
                {isEmployee &&
                    <div className="flex gap-7 font-medium text-[20px]">
                        <button onClick={handleCheckAssignedBriefs} className="bg-sbpurple font-medium text-[18px] px-6 py-2 rounded-full">
                            Check Assigned Briefs
                        </button>
                    </div>
                }
            </div>
        </section>
    )
}