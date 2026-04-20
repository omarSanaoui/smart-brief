import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchBriefsThunk } from "../../features/briefs/briefSlice/briefThunk";
import { selectAllBriefs, selectBriefsLoading } from "../../features/briefs/briefSlice/briefSelectors";
import { FileText, Clock, Filter } from "lucide-react";
import { selectUser } from "../../features/auth/authSlice/authSelectors";
import BriefCard from "../../components/briefs/BriefCard";
import BriefModal from "../../components/briefs/BriefModal";
import { useTranslation } from "react-i18next";

export default function BriefsDashboard() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const briefs = useAppSelector(selectAllBriefs);
  const loading = useAppSelector(selectBriefsLoading);
  const user = useAppSelector(selectUser);

  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);
  const selectedBrief = briefs.find(b => b.id === selectedBriefId) || null;

  const isAdmin = user?.role === "ADMIN";
  const title = isAdmin ? t("dashboard.globalTitle") : t("dashboard.assignedTitle");
  const subtitle = isAdmin ? t("dashboard.adminSubtitle") : t("dashboard.employeeSubtitle");

  useEffect(() => { dispatch(fetchBriefsThunk()); }, [dispatch]);

  return (
    <section className="font-poppins text-white min-h-[calc(100vh-80px)] pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-x-hidden">
      <BriefModal brief={selectedBrief} isOpen={!!selectedBriefId} onClose={() => setSelectedBriefId(null)} userRole={user?.role} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 border-b border-[#2E3A5C]/40 pb-10">
        <div>
          <h1 className="text-[36px] md:text-[52px] font-black tracking-widest uppercase leading-tight">
            {title} <span className="text-sbteal">{t("dashboard.dashboardSuffix")}</span>
          </h1>
          <p className="text-[#64748B] text-sm mt-3 font-medium tracking-wide max-w-xl">{subtitle}</p>
        </div>

        {isAdmin && (
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none bg-[#1A2238]/60 px-6 py-3 rounded-2xl flex items-center gap-3 border border-[#2E3A5C]/40">
              <div className="bg-sbpurple/20 p-2 rounded-lg"><FileText size={16} className="text-sbpurple" /></div>
              <div className="flex flex-col">
                <span className="text-[9px] text-[#64748B] uppercase font-black tracking-widest leading-none mb-1">{t("dashboard.totalDocs")}</span>
                <span className="font-bold text-lg leading-none">{briefs.length}</span>
              </div>
            </div>
            <div className="flex-1 md:flex-none bg-[#1A2238]/60 px-6 py-3 rounded-2xl flex items-center gap-3 border border-[#2E3A5C]/40">
              <div className="bg-amber-400/20 p-2 rounded-lg"><Clock size={16} className="text-amber-400" /></div>
              <div className="flex flex-col">
                <span className="text-[9px] text-[#64748B] uppercase font-black tracking-widest leading-none mb-1">{t("dashboard.pending")}</span>
                <span className="font-bold text-lg leading-none">{briefs.filter(b => b.status === "PENDING").length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-[#64748B] font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-2">
          <Filter size={14} /> {t("dashboard.activeDocumentation")}
        </h2>
      </div>

      {loading && briefs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-sbteal/20 blur-xl rounded-full animate-pulse" />
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sbteal relative z-10" />
          </div>
          <span className="text-[#64748B] font-bold text-xs uppercase tracking-widest animate-pulse">{t("dashboard.loading")}</span>
        </div>
      ) : briefs.length === 0 ? (
        <div className="bg-[#1A2238]/50 border border-[#2E3A5C] backdrop-blur-sm rounded-[32px] p-16 flex flex-col items-center justify-center text-center shadow-2xl">
          <FileText className="w-16 h-16 text-white/5 mb-6" />
          <h3 className="text-xl font-black uppercase tracking-wider mb-2">{t("dashboard.empty.title")}</h3>
          <p className="text-[#64748B] text-sm font-medium">{t("dashboard.empty.subtitle")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {briefs.map((brief) => (
            <BriefCard key={brief.id} brief={brief} onClick={() => setSelectedBriefId(brief.id)} showAdminInfo={isAdmin} />
          ))}
        </div>
      )}
    </section>
  );
}
