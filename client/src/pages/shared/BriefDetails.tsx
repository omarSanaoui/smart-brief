import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchBriefByIdThunk, updateBriefThunk, deleteBriefThunk, assignBriefThunk } from "../../features/briefs/briefSlice/briefThunk";
import { selectCurrentBrief, selectBriefsLoading } from "../../features/briefs/briefSlice/briefSelectors";
import { selectUser } from "../../features/auth/authSlice/authSelectors";
import { ArrowLeft, Clock, CheckCircle, XCircle, Edit, Calendar, DollarSign, Download, Users, Trash2 } from "lucide-react";
import type { BriefStatus } from "../../features/briefs/briefSlice/briefTypes";

const StatusBadgeLarge = ({ status }: { status: BriefStatus }) => {
  switch (status) {
    case 'PENDING':
      return <div className="flex items-center gap-2 text-yellow-400 bg-yellow-400/10 px-4 py-2 rounded-lg font-bold"><Clock size={16} /> PENDING REVIEW</div>;
    case 'ACCEPTED':
      return <div className="flex items-center gap-2 text-sbteal bg-sbteal/10 px-4 py-2 rounded-lg font-bold"><CheckCircle size={16} /> ACCEPTED</div>;
    case 'IN_PROGRESS':
      return <div className="flex items-center gap-2 text-blue-400 bg-blue-400/10 px-4 py-2 rounded-lg font-bold"><Edit size={16} /> IN PROGRESS</div>;
    case 'COMPLETED':
      return <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-lg font-bold"><CheckCircle size={16} /> COMPLETED</div>;
    case 'REFUSED':
      return <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg font-bold"><XCircle size={16} /> REFUSED</div>;
    default:
      return null;
  }
}

export default function BriefDetails() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const brief = useAppSelector(selectCurrentBrief);
  const loading = useAppSelector(selectBriefsLoading);
  const user = useAppSelector(selectUser);

  const isAdmin = user?.role === "ADMIN";
  const isEmployee = user?.role === "EMPLOYEE";
  const isClient = user?.role === "CLIENT";

  const [assigning, setAssigning] = useState(false);
  const [mockEmployeeId, setMockEmployeeId] = useState("");

  useEffect(() => {
    if (id) dispatch(fetchBriefByIdThunk(id));
  }, [id, dispatch]);

  const handleUpdateStatus = async (status: BriefStatus) => {
    if (!brief) return;
    await dispatch(updateBriefThunk({ id: brief.id, data: { status } }));
  };

  const handleDelete = async () => {
    if (!brief || !window.confirm("Are you sure you want to delete this brief?")) return;
    await dispatch(deleteBriefThunk(brief.id));
    navigate(-1);
  };

  const handleAssign = async () => {
    if (!brief || !mockEmployeeId) return;
    await dispatch(assignBriefThunk({ briefId: brief.id, employeeIds: [mockEmployeeId] }));
    setAssigning(false);
    setMockEmployeeId("");
  };

  if (loading || !brief) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sbteal"></div>
      </div>
    );
  }

  return (
    <section className="font-poppins text-white min-h-[calc(100vh-80px)] pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1000px] mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-[#1A2238] border border-[#2E3A5C] rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-[200px] -right-[200px] w-[400px] h-[400px] bg-sbpurple/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10 relative z-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{brief.title}</h1>
            <div className="flex flex-wrap gap-3">
               <span className="bg-[#2D3652] text-white/80 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide border border-[#2E3A5C]">
                 {brief.projectType.replace('_', ' ')}
               </span>
               <StatusBadgeLarge status={brief.status} />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
             {/* Admin Actions */}
             {isAdmin && brief.status === 'PENDING' && (
               <>
                 <button onClick={() => handleUpdateStatus('ACCEPTED')} className="bg-sbteal hover:bg-[#52a68e] text-black font-bold px-6 py-2.5 rounded-lg transition-colors">
                   Accept
                 </button>
                 <button onClick={() => handleUpdateStatus('REFUSED')} className="bg-transparent border border-red-400 text-red-400 hover:bg-red-400/10 font-bold px-6 py-2.5 rounded-lg transition-colors">
                   Refuse
                 </button>
               </>
             )}

             {isAdmin && brief.status === 'ACCEPTED' && (
               <button onClick={() => setAssigning(!assigning)} className="bg-sbpurple hover:bg-[#3a44b0] text-white font-bold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2">
                 <Users size={18} /> Assign Team
               </button>
             )}

             {isAdmin && (
               <button onClick={handleDelete} title="Delete Brief" className="bg-transparent border border-red-500/50 text-red-400 hover:bg-red-500/10 p-2.5 rounded-lg transition-colors">
                 <Trash2 size={18} />
               </button>
             )}

             {/* Employee Actions */}
             {isEmployee && brief.status === 'ACCEPTED' && (
               <button onClick={() => handleUpdateStatus('IN_PROGRESS')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-lg transition-colors">
                 Start Working
               </button>
             )}
             {isEmployee && brief.status === 'IN_PROGRESS' && (
               <button onClick={() => handleUpdateStatus('COMPLETED')} className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2.5 rounded-lg transition-colors">
                 Mark as Completed
               </button>
             )}

             {/* Client Actions */}
             {isClient && brief.status === 'COMPLETED' && (
               <button className="bg-sbpurple hover:bg-[#3a44b0] text-white font-bold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2">
                 <Download size={18} /> Download Deliverables
               </button>
             )}
          </div>
        </div>

        {/* Dummy Assignment UI for Admin */}
        {assigning && (
          <div className="bg-[#2D3652] p-6 rounded-xl border border-[#2E3A5C] mb-8 animate-in slide-in-from-top-2">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Users size={16}/> Assign Employee</h3>
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="Enter Employee ID (Mock)" 
                value={mockEmployeeId}
                onChange={e => setMockEmployeeId(e.target.value)}
                className="flex-1 bg-[#1A2238] border border-[#2E3A5C] rounded-md px-4 py-2 text-sm focus:outline-none focus:border-sbteal"
              />
              <button 
                onClick={handleAssign}
                className="bg-sbteal hover:bg-[#52a68e] transition-colors text-black font-bold px-6 py-2 rounded-md"
              >
                Assign
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h3 className="text-white/60 uppercase tracking-widest text-xs font-bold mb-3 border-b border-[#2E3A5C] pb-2">Description & Goals</h3>
              <div className="text-white/90 leading-relaxed whitespace-pre-wrap font-light">
                {brief.description || "No description provided."}
              </div>
            </section>

            <section>
              <h3 className="text-white/60 uppercase tracking-widest text-xs font-bold mb-3 border-b border-[#2E3A5C] pb-2">Must-Have Features</h3>
              <div className="flex flex-wrap gap-2">
                {brief.features && brief.features.length > 0 ? (
                  brief.features.map((feature, i) => (
                    <span key={i} className="bg-[#2D3652] text-sbteal px-3 py-1.5 rounded-md text-sm border border-[#2E3A5C]">
                      {feature}
                    </span>
                  ))
                ) : (
                  <span className="text-white/40 italic text-sm">None specified</span>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-[#2D3652] p-5 rounded-xl border border-[#2E3A5C]">
              <h3 className="text-white/60 uppercase tracking-widest text-xs font-bold mb-4">Project Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#1A2238] p-2 rounded-md text-sbteal"><DollarSign size={16} /></div>
                  <div>
                    <p className="text-[10px] text-white/50 uppercase tracking-wider">Budget</p>
                    <p className="font-semibold">{brief.budgetRange || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-[#1A2238] p-2 rounded-md text-sbpurple"><Calendar size={16} /></div>
                  <div>
                    <p className="text-[10px] text-white/50 uppercase tracking-wider">Deadline</p>
                    <p className="font-semibold">{new Date(brief.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#2D3652] p-5 rounded-xl border border-[#2E3A5C]">
              <h3 className="text-white/60 uppercase tracking-widest text-xs font-bold mb-4">Attachments ({brief.attachments?.length || 0})</h3>
              <div className="space-y-2">
                {brief.attachments && brief.attachments.length > 0 ? (
                  brief.attachments.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#1A2238] p-3 rounded-lg border border-[#2E3A5C]">
                      <span className="text-sm truncate w-3/4">{file}</span>
                      <button className="text-sbteal hover:text-white transition-colors"><Download size={14}/></button>
                    </div>
                  ))
                ) : (
                  <p className="text-white/40 italic text-sm text-center py-2">No attachments found</p>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
