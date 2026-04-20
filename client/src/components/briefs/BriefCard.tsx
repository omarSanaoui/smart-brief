import { FileText, ChevronRight, Calendar, DollarSign, Users } from "lucide-react";
import type { Brief } from "../../features/briefs/briefSlice/briefTypes";
import StatusBadge from "./StatusBadge";
import { useTranslation } from "react-i18next";

interface BriefCardProps {
  brief: Brief;
  onClick?: () => void;
  showAdminInfo?: boolean;
}

export default function BriefCard({ brief, onClick, showAdminInfo = false }: BriefCardProps) {
  const { t } = useTranslation();
  return (
    <div
      onClick={onClick}
      className={`group bg-[#1A2238] border border-[#2E3A5C] hover:border-sbteal/50 rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 shadow-xl flex flex-col justify-between ${onClick ? 'cursor-pointer hover:bg-[#1f2845]' : ''}`}
    >
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="bg-[#2D3652] p-3 rounded-xl text-sbpurple group-hover:scale-110 transition-transform duration-300 border border-[#2E3A5C]">
            <FileText size={22} className={brief.status === "COMPLETED" ? "text-emerald-400" : ""} />
          </div>
          <StatusBadge status={brief.status} />
        </div>

        <h3 className="text-xl font-bold mb-1.5 group-hover:text-sbteal transition-colors line-clamp-1" title={brief.title}>
          {brief.title}
        </h3>
        <p className="text-[#64748B] text-[10px] font-mono tracking-[0.2em] mb-6 uppercase flex items-center gap-1.5">
          <span className="w-1 h-3 bg-sbpurple rounded-full" />
          {brief.projectType.replace('_', ' ')}
        </p>

        <div className="grid grid-cols-2 gap-4 border-t border-[#2E3A5C]/50 pt-5 mt-2">
          <div className="flex items-center gap-2.5">
            <div className="text-sbteal/60"><DollarSign size={14} /></div>
            <div className="flex flex-col">
              <span className="text-[#64748B] text-[9px] uppercase font-bold tracking-widest leading-none mb-1">{t("briefCard.budget")}</span>
              <span className="text-sm font-semibold text-white/90">{brief.budgetRange}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="text-sbpurple/80"><Calendar size={14} /></div>
            <div className="flex flex-col">
              <span className="text-[#64748B] text-[9px] uppercase font-bold tracking-widest leading-none mb-1">{t("briefCard.deadline")}</span>
              <span className="text-sm font-semibold text-white/90">
                {new Date(brief.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showAdminInfo ? (
        <div className="mt-6 pt-4 flex items-center justify-between text-[10px] text-white/40 border-t border-[#2E3A5C]/30 italic">
          <span className="flex items-center gap-1.5 bg-[#2D3652]/40 px-2.5 py-1 rounded-md border border-[#2E3A5C]/40">
            <Users size={12} className="text-sbteal/70" /> {brief.assignedToIds?.length || 0} {t("briefCard.team")}
          </span>
          <span>UID: {brief.clientId.substring(0, 8)}...</span>
        </div>
      ) : (
        <button className="mt-8 w-full flex items-center justify-center gap-2 bg-[#2D3652] hover:bg-sbpurple text-white py-3 rounded-xl text-sm font-bold transition-all duration-300 border border-[#2E3A5C] group-hover:border-sbpurple/50 group-hover:shadow-md">
          {t("briefCard.viewDetails")} <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
}
