import { Clock, CheckCircle, Edit, XCircle } from "lucide-react";
import type { BriefStatus } from "../../features/briefs/briefSlice/briefTypes";

interface StatusBadgeProps {
  status: BriefStatus;
  large?: boolean;
}

export default function StatusBadge({ status, large = false }: StatusBadgeProps) {
  const baseClasses = `flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full transition-all duration-300`;
  const sizeClasses = large ? "px-5 py-2.5 text-[10px] md:text-xs" : "px-3 py-1 text-[8px] md:text-[10px]";
  
  switch (status) {
    case 'PENDING':
      return (
        <span className={`${baseClasses} ${sizeClasses} text-amber-400 bg-amber-400/10 border border-amber-400/20`}>
          <Clock size={large ? 14 : 10} /> PENDING REVIEW
        </span>
      );
    case 'ACCEPTED':
      return (
        <span className={`${baseClasses} ${sizeClasses} text-sbteal bg-sbteal/10 border border-sbteal/20`}>
          <CheckCircle size={large ? 14 : 10} /> ACCEPTED
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className={`${baseClasses} ${sizeClasses} text-blue-400 bg-blue-400/10 border border-blue-400/20`}>
          <Edit size={large ? 14 : 10} /> IN PROGRESS
        </span>
      );
    case 'COMPLETED':
      return (
        <span className={`${baseClasses} ${sizeClasses} text-emerald-400 bg-emerald-400/10 border border-emerald-400/20`}>
          <CheckCircle size={large ? 14 : 10} /> COMPLETED
        </span>
      );
    case 'REFUSED':
      return (
        <span className={`${baseClasses} ${sizeClasses} text-rose-400 bg-rose-400/10 border border-rose-400/20`}>
          <XCircle size={large ? 14 : 10} /> REFUSED
        </span>
      );
    default:
      return null;
  }
}
