import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, Clock, CheckCircle, TrendingUp, ArrowRight, AlertCircle } from "lucide-react"
import { useAppSelector, useAppDispatch } from "../app/hooks"
import { selectUser } from "../features/auth/authSlice/authSelectors"
import { selectAllBriefs, selectBriefsLoading } from "../features/briefs/briefSlice/briefSelectors"
import { fetchBriefsThunk } from "../features/briefs/briefSlice/briefThunk"
import { useTranslation } from "react-i18next"
import BriefModal from "../components/briefs/BriefModal"

export default function Home() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { t } = useTranslation()
    const user = useAppSelector(selectUser)
    const briefs = useAppSelector(selectAllBriefs)
    const loading = useAppSelector(selectBriefsLoading)

    const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null)
    const selectedBrief = briefs.find(b => b.id === selectedBriefId) ?? null

    const isAdmin = user?.role === "ADMIN"
    const isClient = user?.role === "CLIENT"
    const isEmployee = user?.role === "EMPLOYEE"

    useEffect(() => {
        dispatch(fetchBriefsThunk())
    }, [dispatch])

    const myBriefs = isClient
        ? briefs.filter(b => b.clientId === user?.id)
        : isEmployee
        ? briefs.filter(b => b.assignedToIds?.includes(user?.id ?? ""))
        : briefs

    const pending = myBriefs.filter(b => b.status === "PENDING").length
    const inProgress = myBriefs.filter(b => b.status === "IN_PROGRESS").length
    const completed = myBriefs.filter(b => b.status === "COMPLETED").length
    const accepted = myBriefs.filter(b => b.status === "ACCEPTED").length

    const recentBriefs = [...myBriefs]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)

    const statusColor: Record<string, string> = {
        PENDING: "text-amber-400 bg-amber-400/10 border-amber-400/20",
        ACCEPTED: "text-sbteal bg-sbteal/10 border-sbteal/20",
        IN_PROGRESS: "text-blue-400 bg-blue-400/10 border-blue-400/20",
        COMPLETED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
        REFUSED: "text-rose-400 bg-rose-400/10 border-rose-400/20",
    }

    return (
        <>
        <section className="relative max-w-300 mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 min-h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="mb-10 sm:mb-14">
                <h1 className="font-bold text-4xl sm:text-6xl lg:text-7xl leading-tight sm:leading-[1.05] mb-6 [text-shadow:0_4px_20px_rgba(0,0,0,0.45),0_1px_2px_rgba(0,0,0,0.6)]">
                    {t("home.welcomeBack")}{" "}
                    <span className="block text-sbteal">{user?.firstName}</span>
                </h1>

                <div className="flex flex-wrap gap-3 font-medium text-sm sm:text-base">
                    {isClient && (
                        <>
                            <button onClick={() => navigate("/new-project")} className="bg-sbpurple px-5 sm:px-7 py-2.5 rounded-full hover:bg-[#3a44b0] transition-colors">
                                {t("home.createProject")}
                            </button>
                            <button onClick={() => navigate("/my-briefs")} className="bg-transparent border-2 border-sbpurple px-5 sm:px-7 py-2.5 rounded-full hover:bg-sbpurple/10 transition-colors">
                                {t("home.checkMyBriefs")}
                            </button>
                        </>
                    )}
                    {isAdmin && (
                        <button onClick={() => navigate("/briefs")} className="bg-sbpurple px-5 sm:px-7 py-2.5 rounded-full hover:bg-[#3a44b0] transition-colors">
                            {t("home.checkBriefs")}
                        </button>
                    )}
                    {isEmployee && (
                        <button onClick={() => navigate("/assigned-briefs")} className="bg-sbpurple px-5 sm:px-7 py-2.5 rounded-full hover:bg-[#3a44b0] transition-colors">
                            {t("home.checkAssignedBriefs")}
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
                {[
                    { label: t("home.statTotal"), value: myBriefs.length, icon: <FileText size={18} />, color: "text-white/60", border: "border-[#2E3A5C]/40" },
                    { label: t("home.statPending"), value: pending, icon: <Clock size={18} />, color: "text-amber-400", border: "border-amber-400/20" },
                    { label: t("home.statInProgress"), value: inProgress + accepted, icon: <TrendingUp size={18} />, color: "text-blue-400", border: "border-blue-400/20" },
                    { label: t("home.statCompleted"), value: completed, icon: <CheckCircle size={18} />, color: "text-emerald-400", border: "border-emerald-400/20" },
                ].map(({ label, value, icon, color, border }) => (
                    <div key={label} className={`rounded-2xl border ${border} bg-[#1A2238]/40 px-5 py-4 flex flex-col gap-2`}>
                        <div className={`${color} opacity-80`}>{icon}</div>
                        <p className="text-2xl font-black text-white">{loading ? "—" : value}</p>
                        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{label}</p>
                    </div>
                ))}
            </div>

            {/* Recent briefs */}
            <div>
                <h2 className="text-[10px] uppercase tracking-widest font-black text-white/40 mb-4 flex items-center gap-2">
                    <FileText size={12} /> {t("home.recentBriefs")}
                </h2>

                {loading ? (
                    <div className="text-white/30 text-sm">{t("dashboard.loading")}</div>
                ) : recentBriefs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#2E3A5C]/40 py-12 text-center">
                        <AlertCircle size={28} className="text-white/20" />
                        <p className="text-white/30 text-sm font-medium">{t("home.noBriefs")}</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {recentBriefs.map(brief => (
                            <div key={brief.id} onClick={() => setSelectedBriefId(brief.id)} className="cursor-pointer flex items-center justify-between rounded-2xl border border-[#2E3A5C]/40 bg-[#1A2238]/30 px-5 py-4 hover:bg-[#1A2238]/60 transition-all group">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="h-9 w-9 shrink-0 rounded-xl bg-sbpurple/20 border border-sbpurple/20 flex items-center justify-center">
                                        <FileText size={15} className="text-sbpurple" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-semibold text-sm truncate">{brief.title}</p>
                                        <p className="text-white/40 text-[11px] mt-0.5">{new Date(brief.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 ml-4">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${statusColor[brief.status]}`}>
                                        {t(`status.${brief.status}`)}
                                    </span>
                                    <ArrowRight size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>

        <BriefModal
            brief={selectedBrief}
            isOpen={!!selectedBriefId}
            onClose={() => setSelectedBriefId(null)}
            userRole={user?.role}
        />
        </>
    )
}
