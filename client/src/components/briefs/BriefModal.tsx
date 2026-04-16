import { useState, useEffect } from "react";
import { X, Calendar, DollarSign, Download, Users, Trash2, Edit, CheckCircle } from "lucide-react";
import type { Brief, BriefStatus } from "../../features/briefs/briefSlice/briefTypes";
import StatusBadge from "./StatusBadge";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { updateBriefThunk, assignBriefThunk, deleteBriefThunk, fetchEmployeesThunk } from "../../features/briefs/briefSlice/briefThunk";
import { selectEmployees } from "../../features/briefs/briefSlice/briefSelectors";
import api from "../../features/briefs/api/briefAxios";
import EditBriefModal from "./EditBriefModal";
import ConfirmDialog from "../shared/ConfirmDialog";
import TaskSection from "./TaskSection";

interface BriefModalProps {
  brief: Brief | null;
  isOpen: boolean;
  onClose: () => void;
  userRole: string | undefined;
}

export default function BriefModal({ brief, isOpen, onClose, userRole }: BriefModalProps) {
  const dispatch = useAppDispatch();
  const employees = useAppSelector(selectEmployees);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchEmployeesThunk());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  if (!isOpen || !brief) return null;

  const isAdmin = userRole === "ADMIN";
  const isEmployee = userRole === "EMPLOYEE";
  const isClient = userRole === "CLIENT";

  const handleUpdateStatus = async (status: BriefStatus) => {
    await dispatch(updateBriefThunk({ id: brief.id, data: { status }, userRole }));
  };

  const handleAssign = async () => {
    if (!selectedEmployees.length) return;
    await dispatch(assignBriefThunk({ briefId: brief.id, employeeIds: selectedEmployees }));
    setIsAssignModalOpen(false);
    setSelectedEmployees([]);
  };

  const handleDelete = () => setConfirmDeleteOpen(true);

  const confirmDelete = async () => {
    setConfirmDeleteOpen(false);
    await dispatch(deleteBriefThunk(brief.id));
    onClose();
  };

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`/briefs/${brief.id}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `brief-${brief.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export PDF. Please try again.");
    }
  };


  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4 py-6 sm:p-0">
      {isEditOpen && (
        <EditBriefModal
          brief={brief}
          isOpen
          onClose={() => setIsEditOpen(false)}
        />
      )}
      {confirmDeleteOpen && (
        <ConfirmDialog
          message="Are you sure you want to delete this brief? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDeleteOpen(false)}
        />
      )}
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[#0A0F1E]/95 backdrop-blur-md transition-opacity duration-500 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[900px] max-h-[90vh] bg-[#141B2D] border border-[#2E3A5C] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
        
        {/* Left Side: Summary & Actions (Fixed) */}
        <div className="w-full md:w-[300px] lg:w-[320px] bg-[#1A2238] border-b md:border-b-0 md:border-r border-[#2E3A5C] flex flex-col pt-4 sm:pt-10 px-4 sm:px-7 pb-4 sm:pb-6 relative overflow-hidden shrink-0">

          <div className="absolute -top-20 -left-20 w-40 h-40 bg-sbpurple/10 blur-[60px] rounded-full pointer-events-none"></div>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors bg-[#0A0F1E]/30 p-2 rounded-full md:hidden"
          >
            <X size={18} />
          </button>

          <div className="relative z-10 space-y-3 sm:space-y-8">
            <div className="space-y-1.5 sm:space-y-4">
              <div className="inline-block">
                <StatusBadge status={brief.status} large />
              </div>
              <h2 className="text-lg sm:text-3xl font-bold font-poppins text-white leading-tight wrap-break-word" title={brief.title}>
                {brief.title}
              </h2>
              <p className="text-white/40 text-[10px] font-mono tracking-[0.2em] uppercase font-bold flex items-center gap-2">
                 <span className="w-1 h-3 bg-sbteal rounded-full"></span>
                 {brief.projectType.replace('_', ' ')}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-0 bg-[#0F1528]/50 p-3 sm:p-5 rounded-2xl border border-[#2E3A5C]/40">
              <div className="flex items-center gap-3">
                <div className="bg-[#2D3652] p-2 sm:p-2.5 rounded-xl text-sbteal border border-[#2E3A5C] shrink-0"><DollarSign size={16} /></div>
                <div>
                  <p className="text-[9px] text-[#64748B] uppercase font-bold tracking-widest leading-none mb-1">Budget</p>
                  <p className="text-xs sm:text-sm font-bold text-white/90 leading-tight">{brief.budgetRange || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:pt-4 sm:border-t border-[#2E3A5C]/20">
                <div className="bg-[#2D3652] p-2 sm:p-2.5 rounded-xl text-sbpurple border border-[#2E3A5C] shrink-0"><Calendar size={16} /></div>
                <div>
                  <p className="text-[9px] text-[#64748B] uppercase font-bold tracking-widest leading-none mb-1">Launch Target</p>
                  <p className="text-xs sm:text-sm font-bold text-white/90 leading-tight">
                    {new Date(brief.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Role Actions */}
            <div className="hidden md:flex flex-col gap-3 py-4">
               {isAdmin && brief.status === 'PENDING' && (
                 <>
                   <button onClick={() => handleUpdateStatus('ACCEPTED')} className="w-full bg-sbteal hover:bg-[#52a68e] text-[#0F1528] font-black uppercase text-xs tracking-widest py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-sbteal/20">
                     Accept Project
                   </button>
                   <button onClick={() => handleUpdateStatus('REFUSED')} className="w-full bg-transparent border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-bold uppercase text-xs tracking-widest py-3.5 rounded-xl transition-all active:scale-95">
                     Refuse Project
                   </button>
                 </>
               )}
                {isAdmin && (brief.status === 'ACCEPTED' || brief.status === 'IN_PROGRESS') && (
                  <button onClick={() => setIsAssignModalOpen(!isAssignModalOpen)} className="w-full bg-sbpurple hover:bg-[#3a44b0] text-white font-bold uppercase text-xs tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                    <Users size={16} /> {isAssignModalOpen ? "Cancel Assign" : "Manage Team"}
                  </button>
                )}
               {isEmployee && brief.status === 'ACCEPTED' && (
                 <button onClick={() => handleUpdateStatus('IN_PROGRESS')} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold uppercase text-xs tracking-widest py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20">
                   Start Production
                 </button>
               )}
               {isEmployee && brief.status === 'IN_PROGRESS' && (
                 <button onClick={() => handleUpdateStatus('COMPLETED')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold uppercase text-xs tracking-widest py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                   Mark Completed
                 </button>
               )}
               {isClient && brief.status === "PENDING" && (
                 <button onClick={handleEdit} className="w-full bg-sbpurple hover:bg-[#3a44b0] text-white font-bold uppercase text-xs tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                   <Edit size={16} /> Edit Brief
                 </button>
               )}
               {isAdmin && (
                 <button onClick={handleDelete} className="w-full text-rose-500/50 hover:text-rose-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center px-4 py-2 hover:bg-rose-500/5 rounded-lg transition-all mt-4">
                   <Trash2 size={12} className="mr-2" /> Permanently Delete
                 </button>
               )}
               {isClient && brief.status === "PENDING" && (
                 <button onClick={handleDelete} className="w-full text-rose-500/50 hover:text-rose-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center px-4 py-2 hover:bg-rose-500/5 rounded-lg transition-all mt-2">
                   <Trash2 size={12} className="mr-2" /> Delete Brief
                 </button>
               )}
            </div>
          </div>
        </div>

        {/* Right Side: Details (Scrollable) */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#141B2D]">
           {/* Fixed Header on top of scroll */}
            <div className="flex justify-between items-center px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-b border-[#2E3A5C]/40 bg-[#141B2D]/80 backdrop-blur-sm sticky top-0 z-20">
               <h3 className="text-[#64748B] font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                 <FileText size={14} className="text-sbteal"/> Brief Documentation
               </h3>
               <div className="flex items-center gap-3">
                 <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 text-sbteal hover:text-white transition-all bg-sbteal/10 hover:bg-sbteal px-4 py-2 rounded-xl text-xs font-bold border border-sbteal/20"
                 >
                   Export PDF <Download size={16} />
                 </button>
                 <button 
                   onClick={onClose} 
                   className="hidden md:flex items-center gap-2 text-white/30 hover:text-white transition-all bg-[#2D3652]/40 hover:bg-[#2D3652] px-4 py-2 rounded-xl text-xs font-bold border border-[#2E3A5C]/40"
                 >
                   Close <X size={16} />
                 </button>
               </div>
            </div>

           <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 thin-scrollbar space-y-8 md:space-y-12">
              
              <div className="bg-[#1A2238]/30 border border-[#2E3A5C]/40 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sbpurple/5 blur-3xl rounded-full"></div>
                <h4 className={`font-black text-xs uppercase tracking-widest ${isAdmin ? 'text-sbpurple' : 'text-[#64748B]'} mb-4 flex items-center gap-2 relative z-10`}>
                  <Users size={14}/> {isAdmin ? "Resource Allocation" : "Assigned Team"}
                </h4>
                
                <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                  {brief.assignedToIds && brief.assignedToIds.length > 0 ? (
                    brief.assignedToIds.map(id => {
                      const emp = employees.find(e => e.id === id);
                      return (
                        <div key={id} className="bg-[#141B2D] border border-[#2E3A5C] px-3 py-1.5 rounded-xl flex items-center gap-2 group transition-all hover:border-sbpurple/30">
                          <div className="w-6 h-6 bg-sbpurple/20 rounded-full flex items-center justify-center text-[9px] font-black text-sbpurple uppercase">
                            {emp ? `${emp.firstName[0]}${emp.lastName[0]}` : "?"}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] text-white/90 font-bold leading-none">
                              {emp ? `${emp.firstName} ${emp.lastName}` : "Assigned User"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">No team members assigned</p>
                  )}
                </div>

                {isAdmin && (
                  <button 
                    onClick={() => {
                      setSelectedEmployees(brief.assignedToIds || []);
                      setIsAssignModalOpen(true);
                    }}
                    className="bg-sbpurple hover:bg-sbpurple/80 text-white font-black uppercase text-[10px] tracking-widest px-8 py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-sbpurple/20 w-full relative z-10"
                  >
                    {brief.assignedToIds?.length > 0 ? "Edit Team Allocation" : "Assign Resources"}
                  </button>
                )}
              </div>

              <section>
                 <h4 className="text-sbteal font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Edit size={12}/> Vision & Project Scope
                 </h4>
                 <div className="bg-[#1A2238]/30 border border-[#2E3A5C]/30 p-6 rounded-2xl relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sbteal/5 blur-2xl rounded-full"></div>
                    <p className="text-white/80 leading-relaxed whitespace-pre-wrap font-light relative z-10">
                      {brief.description}
                    </p>
                 </div>
              </section>

              <section>
                 <h4 className="text-sbpurple font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2 text-glow">
                   <CheckCircle size={12}/> Critical Feature Set
                 </h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {brief.features.map((feature, i) => (
                     <div key={i} className="flex items-center gap-3 bg-[#1A2238]/50 border border-[#2E3A5C]/40 p-4 rounded-xl group hover:border-sbteal/30 hover:bg-[#1A2238] transition-all">
                        <div className="w-2 h-2 bg-sbteal rounded-full shadow-[0_0_8px_rgba(103,207,177,0.5)]"></div>
                        <span className="text-sm text-white/90 font-medium">{feature}</span>
                     </div>
                   ))}
                 </div>
              </section>

              <section>
                <TaskSection briefId={brief.id} userRole={userRole} />
              </section>

              <section className="pb-8">
                 <h4 className="text-[#64748B] font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Download size={12}/> Assets & Attachments
                 </h4>
                 <div className="grid grid-cols-1 gap-3">
                   {brief.attachments.length > 0 ? (
                     brief.attachments.map((file, i) => (
                       <div key={i} className="flex items-center justify-between bg-[#1A2238]/30 border border-[#2E3A5C]/30 p-4 rounded-xl hover:bg-[#1A2238]/60 transition-all group">
                         <div className="flex items-center gap-3">
                           <div className="bg-[#2D3652] p-2 rounded-lg text-white/40"><FileText size={16}/></div>
                           <span className="text-sm font-medium text-white/70 truncate max-w-[200px] sm:max-w-md">{file}</span>
                         </div>
                         <button className="bg-sbteal/10 hover:bg-sbteal text-sbteal hover:text-[#0F1528] p-2.5 rounded-lg transition-all group-hover:scale-105">
                           <Download size={14}/>
                         </button>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-8 border-2 border-dashed border-[#2E3A5C]/30 rounded-2xl text-white/20 text-xs font-bold uppercase tracking-widest">
                       No Assets Linked
                     </div>
                   )}
                 </div>
              </section>

              {/* Mobile actions */}
              <div className="flex md:hidden flex-col gap-3 border-t border-[#2E3A5C]/40 mt-8 pt-6 pb-4">
                {isAdmin && brief.status === 'PENDING' && (
                  <>
                    <button onClick={() => handleUpdateStatus('ACCEPTED')} className="w-full bg-sbteal hover:bg-[#52a68e] text-[#0F1528] font-black uppercase text-xs tracking-widest py-3.5 rounded-xl transition-all">Accept Project</button>
                    <button onClick={() => handleUpdateStatus('REFUSED')} className="w-full bg-transparent border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-bold uppercase text-xs tracking-widest py-3.5 rounded-xl transition-all">Refuse Project</button>
                  </>
                )}
                {isAdmin && (brief.status === 'ACCEPTED' || brief.status === 'IN_PROGRESS') && (
                  <button onClick={() => setIsAssignModalOpen(!isAssignModalOpen)} className="w-full bg-sbpurple hover:bg-[#3a44b0] text-white font-bold uppercase text-xs tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                    <Users size={16} /> {isAssignModalOpen ? "Cancel Assign" : "Manage Team"}
                  </button>
                )}
                {isEmployee && brief.status === 'ACCEPTED' && (
                  <button onClick={() => handleUpdateStatus('IN_PROGRESS')} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold uppercase text-xs tracking-widest py-3.5 rounded-xl transition-all">Start Production</button>
                )}
                {isEmployee && brief.status === 'IN_PROGRESS' && (
                  <button onClick={() => handleUpdateStatus('COMPLETED')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold uppercase text-xs tracking-widest py-3.5 rounded-xl transition-all">Mark Completed</button>
                )}
                {isClient && brief.status === 'PENDING' && (
                  <button onClick={handleEdit} className="w-full bg-sbpurple hover:bg-[#3a44b0] text-white font-bold uppercase text-xs tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                    <Edit size={16} /> Edit Brief
                  </button>
                )}
                {isAdmin && (
                  <button onClick={handleDelete} className="w-full text-rose-500/50 hover:text-rose-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center px-4 py-2 hover:bg-rose-500/5 rounded-lg transition-all mt-2">
                    <Trash2 size={12} className="mr-2" /> Permanently Delete
                  </button>
                )}
                {isClient && brief.status === 'PENDING' && (
                  <button onClick={handleDelete} className="w-full text-rose-500/50 hover:text-rose-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center px-4 py-2 hover:bg-rose-500/5 rounded-lg transition-all mt-2">
                    <Trash2 size={12} className="mr-2" /> Delete Brief
                  </button>
                )}
              </div>
           </div>
        </div>

      </div>

      {/* Assign Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141B2D] border border-[#2E3A5C] rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-white font-black text-lg mb-6 flex items-center gap-2">
              <Users size={20} className="text-sbpurple"/> Assign Team Members
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto thin-scrollbar pr-2">
              {employees.map(employee => (
                <label key={employee.id} className="flex items-center gap-3 p-3 bg-[#1A2238]/30 rounded-xl hover:bg-[#1A2238]/50 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(employee.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmployees([...selectedEmployees, employee.id]);
                      } else {
                        setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id));
                      }
                    }}
                    className="w-4 h-4 text-sbpurple bg-[#0A101F] border-[#2E3A5C] rounded focus:ring-sbpurple"
                  />
                  <div>
                    <div className="text-white font-medium">{employee.firstName} {employee.lastName}</div>
                    <div className="text-white/50 text-sm">{employee.email}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="flex-1 bg-[#2E3A5C] text-white font-bold py-3 rounded-xl hover:bg-[#3A4A6C] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedEmployees.length}
                className="flex-1 bg-sbpurple text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-sbpurple/20 transition-all"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .thin-scrollbar::-webkit-scrollbar { width: 4px; }
        .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background: #2E3A5C; border-radius: 10px; }
        .thin-scrollbar::-webkit-scrollbar-thumb:hover { background: #414CC4; }
        .text-glow { text-shadow: 0 0 10px rgba(65, 76, 196, 0.4); }
      `}</style>
    </div>
  );
}

const FileText = ({ size, className }: { size?: number, className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
