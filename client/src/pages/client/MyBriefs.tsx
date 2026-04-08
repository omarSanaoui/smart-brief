import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchBriefsThunk } from "../../features/briefs/briefSlice/briefThunk";
import { selectAllBriefs, selectBriefsLoading } from "../../features/briefs/briefSlice/briefSelectors";
import { useNavigate } from "react-router-dom";
import { FileText, Plus } from "lucide-react";
import { selectUser } from "../../features/auth/authSlice/authSelectors";
import BriefCard from "../../components/briefs/BriefCard";
import BriefModal from "../../components/briefs/BriefModal";
import type { Brief } from "../../features/briefs/briefSlice/briefTypes";

export default function MyBriefs() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const briefs = useAppSelector(selectAllBriefs);
  const loading = useAppSelector(selectBriefsLoading);
  const user = useAppSelector(selectUser);

  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);
  const selectedBrief = briefs.find(b => b.id === selectedBriefId) || null;

  useEffect(() => {
    dispatch(fetchBriefsThunk());
  }, [dispatch]);

  const handleOpenBrief = (brief: Brief) => {
    setSelectedBriefId(brief.id);
  };

  return (
    <section className="font-poppins text-white sm:min-h-[calc(100vh-80px)] pt-10 sm:pt-16 pb-10 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-x-hidden">
      
      <BriefModal 
        brief={selectedBrief} 
        isOpen={!!selectedBriefId} 
        onClose={() => setSelectedBriefId(null)} 
        userRole={user?.role}
      />

      <div className="flex justify-between items-end mb-16 relative">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-sbteal/10 blur-[50px] rounded-full"></div>
        <div>
          <h1 className="text-[36px] md:text-[52px] font-black tracking-widest uppercase leading-tight">
            PROJECT <span className="text-sbteal">LEDGER</span>
          </h1>
          <p className="text-[#64748B] text-sm mt-3 font-medium tracking-wide">Command center for your professional documentation.</p>
        </div>
        <button 
          onClick={() => navigate('/new-project')} 
          className="group bg-sbpurple hover:bg-[#3a44b0] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-2xl shadow-sbpurple/20 hidden md:flex items-center gap-2 transform active:scale-95"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform" /> New Project
        </button>
      </div>

      <button 
        onClick={() => navigate('/new-project')} 
        className="bg-sbpurple w-full hover:bg-[#3a44b0] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors mb-10 shadow-xl shadow-sbpurple/20 md:hidden flex items-center justify-center gap-2"
      >
        <Plus size={16} /> New Project
      </button>

      {loading && briefs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-sbteal/20 blur-xl rounded-full animate-pulse"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sbteal relative z-10"></div>
          </div>
          <span className="text-[#64748B] font-bold text-xs uppercase tracking-widest animate-pulse">Synchronizing...</span>
        </div>
      ) : briefs.length === 0 ? (
        <div className="bg-[#1A2238]/50 border border-[#2E3A5C] backdrop-blur-sm rounded-[32px] p-16 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-sbpurple/5 blur-[80px] rounded-full"></div>
          <div className="bg-[#2D3652] p-6 rounded-3xl text-white/10 mb-8 border border-[#2E3A5C]">
            <FileText size={48} />
          </div>
          <h3 className="text-2xl font-black mb-3 uppercase tracking-wider">No Documentation Found</h3>
          <p className="text-[#64748B] mb-10 text-sm max-w-sm font-medium">Your project ledger is empty. Submit your first high-performance brief to begin.</p>
          <button 
            onClick={() => navigate('/new-project')} 
            className="bg-white text-[#0F1528] px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-sbteal transition-all duration-300 transform active:scale-95 shadow-xl shadow-white/5"
          >
            Initiate Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {briefs.map((brief) => (
            <BriefCard 
              key={brief.id} 
              brief={brief} 
              onClick={() => handleOpenBrief(brief)} 
            />
          ))}
        </div>
      )}
    </section>
  )
}
