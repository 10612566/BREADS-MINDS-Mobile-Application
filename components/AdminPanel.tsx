
import React, { useState, useEffect } from 'react';
import { BeneficiaryReport, User, TargetGroup, Role, UserStatus, Area, District, Notice, NoticePriority, School, HealthProgram, SchoolProposal, ProposalStatus, SystemLog, ServiceRequest, ServiceRequestCategory } from '../types';
import { analyzeImpact } from '../services/geminiService';
import { 
  BrainCircuit, 
  Loader2, 
  Target as TargetIcon, 
  Settings,
  Users,
  Trash2,
  Plus,
  Pencil,
  AlertCircle,
  Bell,
  Building2,
  ChevronDown,
  ChevronUp,
  School as SchoolIcon,
  Layers,
  CalendarDays,
  X,
  History,
  ShieldAlert,
  MessageSquarePlus,
  Hash,
  Activity,
  User as UserIcon,
  BadgeCheck,
  MapPin,
  Save,
  RotateCcw,
  Globe,
  Map,
  Target,
  ChevronRight,
  GraduationCap,
  Heart,
  Briefcase,
  Users2,
  CheckCircle2,
  Baby,
  ShieldCheck,
  UserCog,
  Key,
  Mail,
  FileText,
  CheckCircle,
  XCircle,
  ArrowRight,
  Info,
  Clock,
  ClipboardCheck,
  Eye,
  Power,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface AdminPanelProps {
  reports: BeneficiaryReport[];
  deadlineDay: number;
  onDeadlineChange: (day: number) => void;
  users: (User & { username: string; password: string })[] ;
  onUpdateUsers: (newUsers: (User & { username: string; password: string })[]) => void;
  annualTargets: Record<TargetGroup, number>;
  onUpdateTargets: (newTargets: Record<TargetGroup, number>) => void;
  areas: Area[];
  districts: District[];
  schools: School[];
  healthPrograms: HealthProgram[];
  onUpdateAreas: (areas: Area[]) => void;
  onUpdateDistricts: (districts: District[]) => void;
  onUpdateSchools: (schools: School[]) => void;
  onUpdateHealthPrograms: (programs: HealthProgram[]) => void;
  notices: Notice[];
  onUpdateNotices: (notices: Notice[]) => void;
  currentUser: User;
  schoolProposals: SchoolProposal[];
  serviceRequests: ServiceRequest[];
  onUpdateServiceRequests: (requests: ServiceRequest[]) => void;
  onResolveServiceRequest?: (requestId: string, action: 'APPROVE' | 'REJECT', remarks?: string) => void;
  onApproveProposal: (proposal: SchoolProposal, remarks: string) => void;
  onRejectProposal: (proposalId: string, remarks: string) => void;
  onResetDatabase: () => void;
  systemLogs: SystemLog[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  reports, 
  deadlineDay, 
  onDeadlineChange,
  users,
  onUpdateUsers,
  annualTargets,
  onUpdateTargets,
  areas,
  districts,
  schools,
  healthPrograms,
  onUpdateAreas,
  onUpdateDistricts,
  onUpdateSchools,
  onUpdateHealthPrograms,
  notices,
  onUpdateNotices,
  currentUser,
  schoolProposals,
  serviceRequests,
  onUpdateServiceRequests,
  onResolveServiceRequest,
  onApproveProposal,
  onRejectProposal,
  onResetDatabase,
  systemLogs
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'INSIGHTS' | 'SERVICE_REQUESTS' | 'USERS' | 'HIERARCHY' | 'CATALOG' | 'NOTICES' | 'SETTINGS' | 'LOGS'>('INSIGHTS');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedAreas, setExpandedAreas] = useState<string[]>([]);
  const [expandedDistricts, setExpandedDistricts] = useState<string[]>([]);
  
  // Processing State
  const [processingRequest, setProcessingRequest] = useState<ServiceRequest | null>(null);
  const [adminRemarks, setAdminRemarks] = useState('');

  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<(User & { username: string; password: string }) | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    username: '',
    password: '',
    role: Role.DISTRICT_COORDINATOR,
    status: UserStatus.ACTIVE,
    districtId: '',
    email: '',
    mobile: ''
  });

  // Hierarchy Modal State
  const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);
  const [hierarchyMode, setHierarchyMode] = useState<'ADD_AREA' | 'EDIT_AREA' | 'ADD_DISTRICT' | 'EDIT_DISTRICT' | 'ADD_SCHOOL' | 'EDIT_SCHOOL'>('ADD_AREA');
  const [hierarchyName, setHierarchyName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Health Program Modal State
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<HealthProgram | null>(null);
  const [programForm, setProgramForm] = useState<Partial<HealthProgram>>({
    name: '',
    objective: '',
    dedicatedFor: TargetGroup.CHILDREN,
    isActive: true
  });

  const [catalogTab, setCatalogTab] = useState<'SCHOOLS' | 'PROGRAMS'>('SCHOOLS');

  const isSuperAdmin = currentUser.role === Role.SUPER_ADMIN;

  useEffect(() => {
    if (areas.length > 0 && expandedAreas.length === 0) {
      setExpandedAreas(areas.map(a => a.id));
    }
  }, [areas]);

  const generateInsights = async () => {
    setLoading(true);
    const result = await analyzeImpact(reports);
    setAnalysis(result);
    setLoading(false);
  };

  useEffect(() => {
    if (reports.length > 0 && !analysis) generateInsights();
  }, [reports]);

  // Decision Handling
  const handleDecision = (action: 'APPROVE' | 'REJECT') => {
    if (!processingRequest || !onResolveServiceRequest) return;
    onResolveServiceRequest(processingRequest.id, action, adminRemarks);
    setProcessingRequest(null);
    setAdminRemarks('');
  };

  // User Management Handlers
  const openUserModal = (u: (User & { username: string; password: string }) | null = null) => {
    if (u) {
      setEditingUser(u);
      setUserForm({
        name: u.name,
        username: u.username,
        password: u.password,
        role: u.role,
        status: u.status,
        districtId: u.districtId || '',
        email: u.email || '',
        mobile: u.mobile || ''
      });
    } else {
      setEditingUser(null);
      setUserForm({
        name: '',
        username: '',
        password: '',
        role: Role.DISTRICT_COORDINATOR,
        status: UserStatus.ACTIVE,
        districtId: '',
        email: '',
        mobile: ''
      });
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, username, password, districtId, email } = userForm;
    if (!name.trim() || !username.trim() || !password.trim() || !districtId || !email.trim()) {
      alert("All mandatory fields (*) must be completed:\n\n1. Full Identity Name\n2. System Username\n3. Login Password\n4. Assigned Operational District\n5. Contact Email");
      return;
    }

    if (editingUser) {
      const updated = users.map(u => u.id === editingUser.id ? { ...u, ...userForm } : u);
      onUpdateUsers(updated);
    } else {
      const newUser = {
        ...userForm,
        id: `u-${Date.now()}`
      };
      onUpdateUsers([...users, newUser]);
    }
    setIsUserModalOpen(false);
  };

  const deleteUser = (id: string) => {
    if (id === currentUser.id) return alert("Cannot delete your own account.");
    if (confirm("Permanently delete this coordinator registry record?")) {
      onUpdateUsers(users.filter(u => u.id !== id));
    }
  };

  const toggleArea = (id: string) => {
    setExpandedAreas(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const toggleDistrict = (id: string) => {
    setExpandedDistricts(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const toggleSchoolStatus = (schoolId: string) => {
    const updatedSchools = schools.map(s => 
      s.id === schoolId ? { ...s, isActive: !s.isActive } : s
    );
    onUpdateSchools(updatedSchools);
  };

  const openHierarchyModal = (mode: typeof hierarchyMode, parentId: string | null = null, item: any = null) => {
    setHierarchyMode(mode);
    setHierarchyName(item?.name || '');
    setSelectedParentId(parentId);
    setEditingItemId(item?.id || null);
    setIsHierarchyModalOpen(true);
  };

  const handleSaveHierarchy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hierarchyName.trim()) return;

    if (hierarchyMode === 'ADD_AREA' || hierarchyMode === 'EDIT_AREA') {
      if (hierarchyMode === 'ADD_AREA') {
        onUpdateAreas([...areas, { id: `a-${Date.now()}`, name: hierarchyName }]);
      } else {
        onUpdateAreas(areas.map(a => a.id === editingItemId ? { ...a, name: hierarchyName } : a));
      }
    } else if (hierarchyMode === 'ADD_DISTRICT' || hierarchyMode === 'EDIT_DISTRICT') {
      if (hierarchyMode === 'ADD_DISTRICT') {
        onUpdateDistricts([...districts, { id: `d-${Date.now()}`, name: hierarchyName, areaId: selectedParentId! }]);
      } else {
        onUpdateDistricts(districts.map(d => d.id === editingItemId ? { ...d, name: hierarchyName } : d));
      }
    } else {
      if (hierarchyMode === 'ADD_SCHOOL') {
        onUpdateSchools([...schools, { id: `s-${Date.now()}`, name: hierarchyName, districtId: selectedParentId!, isActive: true }]);
      } else {
        onUpdateSchools(schools.map(s => s.id === editingItemId ? { ...s, name: hierarchyName } : s));
      }
    }
    setIsHierarchyModalOpen(false);
  };

  const handleDeleteHierarchy = (type: 'AREA' | 'DISTRICT' | 'SCHOOL', id: string) => {
    if (!confirm(`Delete this ${type.toLowerCase()}? This will permanently affect data reporting nodes.`)) return;
    if (type === 'AREA') {
      onUpdateAreas(areas.filter(a => a.id !== id));
    } else if (type === 'DISTRICT') {
      onUpdateDistricts(districts.filter(d => d.id !== id));
    } else {
      onUpdateSchools(schools.filter(s => s.id !== id));
    }
  };

  const openProgramModal = (program: HealthProgram | null = null) => {
    if (program) {
      setEditingProgram(program);
      setProgramForm({ ...program });
    } else {
      setEditingProgram(null);
      setProgramForm({ name: '', objective: '', dedicatedFor: TargetGroup.CHILDREN, isActive: true });
    }
    setIsProgramModalOpen(true);
  };

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programForm.name) return;
    if (editingProgram) {
      onUpdateHealthPrograms(healthPrograms.map(p => p.id === editingProgram.id ? { ...p, ...programForm } as HealthProgram : p));
    } else {
      onUpdateHealthPrograms([...healthPrograms, { id: `hp-${Date.now()}`, name: programForm.name!, objective: programForm.objective || '', dedicatedFor: programForm.dedicatedFor || '', isActive: true }]);
    }
    setIsProgramModalOpen(false);
  };

  const handleDeleteProgram = (id: string) => {
    if (confirm("Permanently delete this intervention template?")) {
      onUpdateHealthPrograms(healthPrograms.filter(p => p.id !== id));
    }
  };

  const getTargetIcon = (group: string) => {
    switch(group) {
      case TargetGroup.CHILDREN: return <Baby size={20}/>;
      case TargetGroup.PARENTS: return <Users2 size={20}/>;
      case TargetGroup.TEACHERS: return <GraduationCap size={20}/>;
      case TargetGroup.PROFESSIONALS: return <Briefcase size={20}/>;
      case TargetGroup.VOLUNTEERS: return <Heart size={20}/>;
      default: return <UserIcon size={20}/>;
    }
  };

  const getRoleIcon = (role: Role) => {
    switch(role) {
      case Role.SUPER_ADMIN: return <ShieldCheck size={18}/>;
      case Role.BREADS_COORDINATOR: return <UserCog size={18}/>;
      default: return <MapPin size={18}/>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        <AdminNavButton active={activeSubTab === 'INSIGHTS'} onClick={() => setActiveSubTab('INSIGHTS')} icon={<BrainCircuit size={18} />} label="Impact Insights" />
        <AdminNavButton active={activeSubTab === 'SERVICE_REQUESTS'} onClick={() => setActiveSubTab('SERVICE_REQUESTS')} icon={<MessageSquarePlus size={18} />} label="Service Requests" />
        <AdminNavButton active={activeSubTab === 'USERS'} onClick={() => setActiveSubTab('USERS')} icon={<Users size={18} />} label="Users" />
        <AdminNavButton active={activeSubTab === 'HIERARCHY'} onClick={() => setActiveSubTab('HIERARCHY')} icon={<Layers size={18} />} label="Hierarchy" />
        <AdminNavButton active={activeSubTab === 'CATALOG'} onClick={() => setActiveSubTab('CATALOG')} icon={<Building2 size={18} />} label="Catalog" />
        <AdminNavButton active={activeSubTab === 'NOTICES'} onClick={() => setActiveSubTab('NOTICES')} icon={<Bell size={18} />} label="Notices" />
        {isSuperAdmin && <AdminNavButton active={activeSubTab === 'LOGS'} onClick={() => setActiveSubTab('LOGS')} icon={<History size={18} />} label="System Logs" />}
        <AdminNavButton active={activeSubTab === 'SETTINGS'} onClick={() => setActiveSubTab('SETTINGS')} icon={<Settings size={18} />} label="Settings" />
      </div>

      <div className="min-h-[500px]">
        {activeSubTab === 'INSIGHTS' && (
          <div className="bg-white rounded-[40px] border p-8 md:p-12 min-h-[400px] shadow-sm animate-in fade-in duration-500">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Loader2 className="animate-spin mb-4 text-blue-600" size={48} />
                <p className="font-black uppercase text-[10px] tracking-[0.2em]">Analyzing Data Architecture...</p>
              </div>
            ) : (
              <div className="prose prose-slate max-w-none text-slate-700 font-medium" dangerouslySetInnerHTML={{ __html: analysis?.replace(/\n/g, '<br/>') || 'No data analysis available yet.' }} />
            )}
          </div>
        )}

        {activeSubTab === 'SERVICE_REQUESTS' && (
          <div className="bg-white rounded-[40px] border shadow-sm overflow-hidden animate-in fade-in">
             <div className="p-8 border-b flex items-center justify-between bg-slate-50/30">
               <div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Decision Queue</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pending Field Staff Submissions</p>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Clock size={14} />
                  <span className="text-[10px] font-black uppercase">{serviceRequests.filter(r => r.status === ProposalStatus.PENDING).length} PENDING</span>
               </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b">
                      <tr>
                        <th className="px-10 py-6">Request ID</th>
                        <th className="px-10 py-6">Subject / Category</th>
                        <th className="px-10 py-6">District Node</th>
                        <th className="px-10 py-6">Proposed By</th>
                        <th className="px-10 py-6">Status</th>
                        <th className="px-10 py-6 text-right">Review</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {(serviceRequests || []).map(request => (
                        <tr key={request.id} className="hover:bg-slate-50/50 group transition-colors">
                           <td className="px-10 py-6">
                              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">#{request.requestNumber}</span>
                           </td>
                           <td className="px-10 py-6">
                              <p className="font-black text-slate-900 truncate max-w-[200px]">{request.schoolSelectionData?.schoolName || request.category}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{request.category}</p>
                           </td>
                           <td className="px-10 py-6">
                              <span className="text-[10px] font-black uppercase text-slate-500">{districts.find(d => d.id === request.districtId)?.name || 'HQ Unit'}</span>
                           </td>
                           <td className="px-10 py-6">
                              <span className="text-[10px] font-black text-slate-700">{request.requestedByName}</span>
                           </td>
                           <td className="px-10 py-6">
                              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${request.status === ProposalStatus.APPROVED ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : request.status === ProposalStatus.REJECTED ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>{request.status}</span>
                           </td>
                           <td className="px-10 py-6 text-right">
                              <button 
                                onClick={() => setProcessingRequest(request)}
                                className={`p-2.5 rounded-xl border transition-all ${request.status === ProposalStatus.PENDING ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white border-slate-100 text-slate-400 hover:text-blue-600'}`}
                              >
                                {request.status === ProposalStatus.PENDING ? <ArrowRight size={18}/> : <Eye size={18}/>}
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
                {(!serviceRequests || serviceRequests.length === 0) && (
                  <div className="py-32 text-center flex flex-col items-center">
                    <History size={48} className="text-slate-100 mb-4" />
                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">No service requests logged</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* DECISION PROCESSING MODAL */}
        {processingRequest && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
             <div className="bg-white w-full max-w-5xl rounded-[44px] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                <div className="p-8 border-b bg-slate-50 flex items-center justify-between shrink-0">
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase">Process Decision</span>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Request {processingRequest.requestNumber}</h3>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><ShieldAlert size={12}/> High-level Technical Audit Required</p>
                   </div>
                   <button onClick={() => setProcessingRequest(null)} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-10 no-scrollbar">
                   <div className="lg:col-span-2 space-y-8">
                      {processingRequest.schoolSelectionData ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
                           <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
                              <div className="flex items-center gap-4">
                                 <div className="p-3 bg-white rounded-2xl shadow-sm"><SchoolIcon size={24} className="text-blue-600"/></div>
                                 <h4 className="text-xl font-black text-slate-900 uppercase">{processingRequest.schoolSelectionData.schoolName}</h4>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-slate-200/60">
                                 <ReviewField label="Distance" value={`${processingRequest.schoolSelectionData.distanceFromCenter} KM`} />
                                 <ReviewField label="Category" value={processingRequest.schoolSelectionData.schoolCategory} />
                                 <ReviewField label="Enrollment" value={processingRequest.schoolSelectionData.totalEnrollment} />
                                 <ReviewField label="Suitability" value={processingRequest.schoolSelectionData.overallSuitability} highlight />
                              </div>
                           </div>
                           
                           <div className="space-y-4">
                              <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"><ClipboardCheck size={14}/> Technical Justification</h5>
                              <div className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><FileText size={60}/></div>
                                 <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{processingRequest.schoolSelectionData.justification}"</p>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="p-6 bg-emerald-50/30 border border-emerald-100 rounded-3xl">
                                 <h6 className="text-[9px] font-black uppercase text-emerald-600 mb-4 tracking-widest">Enrolled Demographics</h6>
                                 <div className="flex justify-between items-end">
                                    <div>
                                       <span className="text-[8px] font-bold text-emerald-400 uppercase">Grand Total</span>
                                       <p className="text-2xl font-black text-emerald-900">{processingRequest.schoolSelectionData.grandTotalTotal}</p>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-[9px] font-black text-emerald-700">{processingRequest.schoolSelectionData.teachersTotal} STAFF</p>
                                       <p className="text-[9px] font-black text-emerald-700">{processingRequest.schoolSelectionData.groupsDivided} GROUPS</p>
                                    </div>
                                 </div>
                              </div>
                              <div className="p-6 bg-blue-50/30 border border-blue-100 rounded-3xl">
                                 <h6 className="text-[9px] font-black uppercase text-blue-600 mb-4 tracking-widest">Health Context</h6>
                                 <div className="flex justify-between items-end">
                                    <div>
                                       <span className="text-[8px] font-bold text-blue-400 uppercase">SDQ Targeted</span>
                                       <p className="text-2xl font-black text-blue-900">{processingRequest.schoolSelectionData.sdqPercentage}%</p>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-[9px] font-black text-blue-700">DROPOUT: {processingRequest.schoolSelectionData.dropoutRatePercentage}%</p>
                                       <p className="text-[9px] font-black text-blue-700">ACAD: {processingRequest.schoolSelectionData.academicPerformancePercentage}%</p>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                      ) : (
                        <div className="p-10 bg-slate-50 rounded-[40px] border border-dashed border-slate-200 h-full">
                           <h4 className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-[0.2em]">Request Description</h4>
                           <p className="text-lg font-black text-slate-800 leading-relaxed italic">"{processingRequest.description}"</p>
                        </div>
                      )}
                   </div>

                   <div className="space-y-8 animate-in slide-in-from-right-4">
                      <div className="p-8 bg-slate-900 rounded-[40px] text-white shadow-2xl space-y-6">
                         <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2"><CheckCircle size={16}/> Final Audit Action</h4>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Official Auditor Remarks</label>
                            <textarea 
                              value={adminRemarks} 
                              onChange={e => setAdminRemarks(e.target.value)}
                              className="w-full h-32 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl font-medium text-xs text-white outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all"
                              placeholder="Required for rejections..."
                            />
                         </div>
                         <div className="flex flex-col gap-3">
                            <button 
                              onClick={() => handleDecision('APPROVE')}
                              disabled={processingRequest.status !== ProposalStatus.PENDING}
                              className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all ${processingRequest.status === ProposalStatus.PENDING ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'}`}
                            >
                               <CheckCircle size={16}/> Ratify & Enroll
                            </button>
                            <button 
                              onClick={() => handleDecision('REJECT')}
                              disabled={processingRequest.status !== ProposalStatus.PENDING || (!adminRemarks && processingRequest.category !== ServiceRequestCategory.SCHOOL_SELECTION)}
                              className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all ${processingRequest.status === ProposalStatus.PENDING ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'}`}
                            >
                               <XCircle size={16}/> Reject Submission
                            </button>
                         </div>
                      </div>

                      <div className="p-8 bg-blue-50 border border-blue-100 rounded-[40px] space-y-4">
                         <div className="flex items-center gap-2"><Info size={14} className="text-blue-500"/><h5 className="text-[9px] font-black uppercase text-blue-600 tracking-widest">Auditor Guidelines</h5></div>
                         <p className="text-[10px] font-medium text-blue-900/60 leading-relaxed">
                            Approving a "School Selection" request will automatically provision a new School node in the project hierarchy for the mapped district. Ensure demographics match baseline survey data before ratification.
                         </p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeSubTab === 'USERS' && (
          <div className="bg-white rounded-[40px] border shadow-sm overflow-hidden animate-in fade-in">
            <div className="p-8 border-b flex items-center justify-between bg-slate-50/30">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Coordinator Registry</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Authorized technical stakeholders</p>
              </div>
              <button 
                onClick={() => openUserModal()}
                className="px-6 py-3 bg-blue-600 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
              >
                <Plus size={16}/> Add New User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b">
                  <tr>
                    <th className="px-10 py-6">Official Identity</th>
                    <th className="px-10 py-6">Operational Role</th>
                    <th className="px-10 py-6">Assigned Node</th>
                    <th className="px-10 py-6">Status</th>
                    <th className="px-10 py-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 group transition-colors">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-black border-2 border-white shadow-sm overflow-hidden">
                             {u.photo ? <img src={u.photo} alt={u.name} className="w-full h-full object-cover" /> : u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 tracking-tight">{u.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2">
                           <span className="p-1.5 bg-slate-100 rounded-lg text-slate-400">{getRoleIcon(u.role)}</span>
                           <span className="text-[10px] font-black uppercase text-slate-600">{u.role.replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                         <span className="text-[10px] font-black uppercase text-slate-500">{districts.find(d => d.id === u.districtId)?.name || 'HQ / Central'}</span>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${u.status === UserStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>{u.status}</span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => openUserModal(u)} className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 rounded-xl shadow-sm"><Pencil size={16}/></button>
                           <button onClick={() => deleteUser(u.id)} className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-rose-600 rounded-xl shadow-sm"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSubTab === 'HIERARCHY' && (
          <div className="space-y-10 animate-in fade-in max-w-7xl mx-auto">
            <div className="bg-white rounded-[44px] border p-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Layers size={140} />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Operational Blueprint</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Regional distribution mapping (3-tier view)</p>
              </div>
              <button onClick={() => openHierarchyModal('ADD_AREA')} className="px-8 py-5 bg-blue-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
                <Plus size={16}/> New Regional Node
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              {areas.map(area => (
                <div key={area.id} className="bg-white rounded-[48px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group/area">
                  <div className="px-10 py-10 flex items-center justify-between border-b border-slate-50">
                    <button onClick={() => toggleArea(area.id)} className="flex items-center gap-8 text-left flex-1">
                      <div className={`w-16 h-16 rounded-[28px] flex items-center justify-center transition-all duration-500 ${expandedAreas.includes(area.id) ? 'bg-slate-900 text-white shadow-2xl rotate-3' : 'bg-slate-50 text-slate-400 group-hover/area:bg-blue-50 group-hover/area:text-blue-600'}`}>
                        <Globe size={32} />
                      </div>
                      <div>
                        <span className="font-black text-slate-900 uppercase tracking-[0.3em] text-sm">{area.name}</span>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Regional Strategic Hub</p>
                      </div>
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => openHierarchyModal('EDIT_AREA', null, area)} className="p-3 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all"><Pencil size={18}/></button>
                      <button onClick={() => handleDeleteHierarchy('AREA', area.id)} className="p-3 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all"><Trash2 size={18}/></button>
                    </div>
                  </div>
                  {expandedAreas.includes(area.id) && (
                    <div className="p-8 space-y-6 bg-slate-50/20 animate-in slide-in-from-top-4 duration-500">
                      {districts.filter(d => d.areaId === area.id).map(dist => (
                        <div key={dist.id} className="space-y-4">
                          <div className="bg-white border border-slate-100 rounded-[40px] p-6 shadow-sm flex items-center justify-between group/dist transition-all hover:border-blue-100">
                             <button onClick={() => toggleDistrict(dist.id)} className="flex items-center gap-5 text-left flex-1">
                               <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center group-hover/dist:scale-110 transition-all ${expandedDistricts.includes(dist.id) ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-50 text-blue-600'}`}>
                                 <Map size={24}/>
                               </div>
                               <div className="flex flex-col">
                                  <span className="font-black text-slate-800 uppercase tracking-widest text-xs">{dist.name}</span>
                                  <span className="text-[8px] font-bold text-slate-300 uppercase mt-0.5">{schools.filter(s => s.districtId === dist.id).length} Enrolled Schools</span>
                               </div>
                             </button>
                             <div className="flex gap-2">
                               <button onClick={() => openHierarchyModal('EDIT_DISTRICT', area.id, dist)} className="p-2.5 text-slate-300 hover:text-blue-600 bg-slate-50 rounded-xl transition-all"><Pencil size={16}/></button>
                               <button onClick={() => handleDeleteHierarchy('DISTRICT', dist.id)} className="p-2.5 text-slate-300 hover:text-rose-600 bg-slate-50 rounded-xl transition-all"><Trash2 size={16}/></button>
                               <button onClick={() => toggleDistrict(dist.id)} className={`p-2.5 rounded-xl transition-all ${expandedDistricts.includes(dist.id) ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                                  {expandedDistricts.includes(dist.id) ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                               </button>
                             </div>
                          </div>

                          {/* SCHOOLS LIST - NESTED UNDER DISTRICT */}
                          {expandedDistricts.includes(dist.id) && (
                            <div className="ml-10 space-y-3 animate-in slide-in-from-top-2 duration-300">
                               <div className="flex items-center justify-between px-4 pb-2">
                                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">School Registry</span>
                                  <button onClick={() => openHierarchyModal('ADD_SCHOOL', dist.id)} className="text-[9px] font-black uppercase text-blue-600 flex items-center gap-1.5 hover:underline">
                                     <Plus size={10}/> Add School
                                  </button>
                               </div>
                               {schools.filter(s => s.districtId === dist.id).map(school => (
                                 <div key={school.id} className={`bg-slate-50 border rounded-[28px] px-6 py-4 flex items-center justify-between group/school transition-all ${school.isActive === false ? 'opacity-60 border-slate-200' : 'hover:bg-white hover:border-blue-200 hover:shadow-lg border-slate-100'}`}>
                                    <div className="flex items-center gap-4">
                                       <div className={`p-2 rounded-xl border transition-colors ${school.isActive === false ? 'bg-slate-100 text-slate-300 border-slate-200' : 'bg-white text-blue-500 border-slate-100 group-hover/school:bg-blue-50'}`}>
                                          <SchoolIcon size={14}/>
                                       </div>
                                       <div className="flex flex-col">
                                          <span className="text-xs font-black text-slate-700 tracking-tight">{school.name}</span>
                                          <span className={`text-[8px] font-black uppercase ${school.isActive === false ? 'text-slate-400' : 'text-emerald-500'}`}>
                                            {school.isActive === false ? 'Inactive' : 'Active'}
                                          </span>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <button 
                                          onClick={() => toggleSchoolStatus(school.id)}
                                          className={`p-1.5 rounded-lg transition-all ${school.isActive === false ? 'text-slate-400 hover:text-emerald-600' : 'text-emerald-500 hover:text-slate-400'}`}
                                          title={school.isActive === false ? 'Activate' : 'Deactivate'}
                                       >
                                          {school.isActive === false ? <ToggleLeft size={20}/> : <ToggleRight size={20}/>}
                                       </button>
                                       <div className="flex gap-1 opacity-0 group-hover/school:opacity-100 transition-opacity">
                                          <button onClick={() => openHierarchyModal('EDIT_SCHOOL', dist.id, school)} className="p-1.5 text-slate-300 hover:text-blue-600"><Pencil size={14}/></button>
                                          <button onClick={() => handleDeleteHierarchy('SCHOOL', school.id)} className="p-1.5 text-slate-300 hover:text-rose-600"><Trash2 size={14}/></button>
                                       </div>
                                    </div>
                                 </div>
                               ))}
                               {schools.filter(s => s.districtId === dist.id).length === 0 && (
                                 <div className="p-6 text-center border-2 border-dashed border-slate-100 rounded-[28px]">
                                    <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest">No schools mapped yet</p>
                                 </div>
                               )}
                            </div>
                          )}
                        </div>
                      ))}
                      <button onClick={() => openHierarchyModal('ADD_DISTRICT', area.id)} className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[32px] text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-blue-600 hover:border-blue-300 transition-all flex items-center justify-center gap-3">
                        <Plus size={16}/> Add Operational District
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'CATALOG' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white rounded-[40px] border p-8 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                 <div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Intervention Catalog</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Project frameworks and templates</p>
                 </div>
                 <div className="flex bg-slate-100 p-1.5 rounded-[24px]">
                    <button onClick={() => setCatalogTab('SCHOOLS')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${catalogTab === 'SCHOOLS' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>Schools</button>
                    <button onClick={() => setCatalogTab('PROGRAMS')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${catalogTab === 'PROGRAMS' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>Health Programs</button>
                 </div>
              </div>
              
              {catalogTab === 'SCHOOLS' ? (
                <div className="overflow-x-auto rounded-[32px] border border-slate-100">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] border-b">
                      <tr>
                        <th className="px-10 py-6">Official Name</th>
                        <th className="px-10 py-6">District Node</th>
                        <th className="px-10 py-6">Status</th>
                        <th className="px-10 py-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {schools.map(school => (
                        <tr key={school.id} className={`hover:bg-slate-50/30 group transition-colors ${school.isActive === false ? 'opacity-60 bg-slate-50/10' : ''}`}>
                          <td className="px-10 py-6 font-black text-slate-900 tracking-tight">{school.name}</td>
                          <td className="px-10 py-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">{districts.find(d => d.id === school.districtId)?.name}</td>
                          <td className="px-10 py-6">
                             <button 
                               onClick={() => toggleSchoolStatus(school.id)}
                               className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${school.isActive === false ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm'}`}
                             >
                               {school.isActive === false ? <Power size={10} className="text-slate-400" /> : <Power size={10} className="text-emerald-500 animate-pulse" />}
                               {school.isActive === false ? 'Inactive' : 'Active'}
                             </button>
                          </td>
                          <td className="px-10 py-6 text-right">
                             <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openHierarchyModal('EDIT_SCHOOL', school.districtId, school)} className="p-2.5 text-slate-300 hover:text-blue-600 transition-all"><Pencil size={18}/></button>
                                <button onClick={() => handleDeleteHierarchy('SCHOOL', school.id)} className="p-2.5 text-slate-300 hover:text-rose-600 transition-all"><Trash2 size={18}/></button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {healthPrograms.map(hp => (
                    <div key={hp.id} className="p-8 bg-white border border-slate-100 rounded-[44px] shadow-sm flex flex-col justify-between group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                       <div>
                          <div className="p-4 bg-slate-50 rounded-3xl w-fit mb-6 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            <Target size={24}/>
                          </div>
                          <h4 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight leading-tight">{hp.name}</h4>
                          <p className="text-xs font-medium text-slate-500 mb-6 italic line-clamp-3 leading-relaxed">"{hp.objective}"</p>
                          <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">{hp.dedicatedFor}</span>
                       </div>
                       <div className="flex gap-3 mt-10 pt-6 border-t border-slate-50">
                          <button onClick={() => openProgramModal(hp)} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-blue-600 border border-blue-100 rounded-2xl hover:bg-blue-50 transition-all">Configure</button>
                          <button onClick={() => handleDeleteProgram(hp.id)} className="p-3 bg-slate-50 text-slate-300 hover:text-rose-600 rounded-2xl transition-all"><Trash2 size={18}/></button>
                       </div>
                    </div>
                  ))}
                  <button onClick={() => openProgramModal()} className="border-2 border-dashed border-slate-200 rounded-[44px] p-10 flex flex-col items-center justify-center text-slate-300 hover:text-blue-600 hover:border-blue-300 transition-all hover:bg-white group min-h-[300px]">
                     <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                        <Plus size={32} />
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-[0.2em]">Add Template</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'SETTINGS' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
             <div className="bg-white rounded-[40px] border p-10 shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><CalendarDays size={24}/></div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Reporting Window</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Cycle deadline configuration</p>
                  </div>
                </div>
                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Lock Day</span>
                      <p className="text-2xl font-black text-slate-900">Day {deadlineDay} <span className="text-sm font-medium text-slate-400 tracking-normal">of month</span></p>
                   </div>
                   <input 
                     type="range" min="1" max="28" 
                     value={deadlineDay} onChange={(e) => onDeadlineChange(parseInt(e.target.value))}
                     className="w-40 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                   />
                </div>
             </div>
             {isSuperAdmin && (
               <div className="lg:col-span-2 bg-rose-50 rounded-[40px] border border-rose-100 p-10 flex items-center justify-between gap-8 mt-4">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-rose-600 text-white rounded-[24px] shadow-lg shadow-rose-200"><ShieldAlert size={32}/></div>
                    <div>
                      <h3 className="text-2xl font-black text-rose-900 tracking-tight uppercase">System Hard Reset</h3>
                      <p className="text-[11px] font-bold text-rose-500 uppercase tracking-widest mt-1">Irreversible database purge. Use with extreme caution.</p>
                    </div>
                  </div>
                  <button onClick={onResetDatabase} className="px-10 py-5 bg-rose-600 text-white rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-rose-700 transition-all flex items-center gap-3 active:scale-95">
                    <RotateCcw size={16}/> Wipe Records
                  </button>
               </div>
             )}
          </div>
        )}
      </div>

      {/* REGISTER NEW COORDINATOR MODAL - MANDATORY FIELDS ENFORCED */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[44px] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[95vh]">
            <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between shrink-0">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{editingUser ? 'Modify Credentials' : 'Register New Coordinator'}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1.5"><ShieldCheck size={12} className="text-blue-500"/> Infrastructure Node Access Control</p>
               </div>
               <button onClick={() => setIsUserModalOpen(false)} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveUser} className="p-8 space-y-8 overflow-y-auto no-scrollbar">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Identity Name <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input type="text" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner" placeholder="Legal Full Name" required />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">System Username <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <UserCog className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input type="text" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner" placeholder="Assign Login ID" required />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Login Password <span className="text-rose-500">*</span></label>
                    <div className="relative">
                       <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                       <input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner" placeholder="••••••••" required />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Assigned Operational District <span className="text-rose-500">*</span></label>
                    <div className="relative">
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                       <select value={userForm.districtId} onChange={e => setUserForm({...userForm, districtId: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm outline-none cursor-pointer focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner appearance-none" required>
                          <option value="">Select District Node...</option>
                          {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          <option value="HQ">Administrative HQ</option>
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Contact Email <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner" placeholder="coordinator@breads.org" required />
                    </div>
                 </div>
               </div>

               <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Administrative Privileges Choice</label>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   {[Role.DISTRICT_COORDINATOR, Role.BREADS_COORDINATOR, Role.SUPER_ADMIN].map(role => (
                     <button
                       key={role}
                       type="button"
                       onClick={() => setUserForm({...userForm, role: role as Role})}
                       className={`p-5 rounded-3xl border flex flex-col items-center gap-3 transition-all ${userForm.role === role ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.02]' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200 hover:bg-slate-50'}`}
                     >
                       <div className={`p-2 rounded-xl ${userForm.role === role ? 'bg-white/10' : 'bg-slate-100'}`}>
                          {getRoleIcon(role as Role)}
                       </div>
                       <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">{role.replace(/_/g, ' ')}</span>
                     </button>
                   ))}
                 </div>
               </div>

               <div className="pt-8 border-t flex gap-4">
                  <button type="button" onClick={() => setIsUserModalOpen(false)} className="flex-1 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 rounded-[28px] transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-5 bg-blue-600 text-white rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-95">
                    <Save size={18}/> Commit User Registration
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Hierarchy Modal */}
      {isHierarchyModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-sm rounded-[44px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
             <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{hierarchyMode.replace(/_/g, ' ')}</h3>
                <button onClick={() => setIsHierarchyModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors"><X size={20}/></button>
             </div>
             <form onSubmit={handleSaveHierarchy} className="p-10 space-y-6">
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Name</label>
                   <input type="text" value={hierarchyName} onChange={e => setHierarchyName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-inner" autoFocus required />
                </div>
                <div className="pt-6 border-t flex gap-4">
                   <button type="button" onClick={() => setIsHierarchyModalOpen(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Cancel</button>
                   <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"><Save size={14}/> Save Node</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Health Program Modal */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[44px] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[95vh]">
             <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{editingProgram ? 'Modify Template' : 'New Intervention Template'}</h3>
                <button onClick={() => { setIsProgramModalOpen(false); setEditingProgram(null); }} className="p-2 hover:bg-slate-200 rounded-xl transition-colors"><X size={20}/></button>
             </div>
             <form onSubmit={handleSaveProgram} className="p-10 space-y-10 overflow-y-auto no-scrollbar">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</label>
                   <input type="text" value={programForm.name || ''} onChange={e => setProgramForm({...programForm, name: e.target.value})} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[28px] font-black text-base outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner" placeholder="e.g. Cognitive Resilience Training" required />
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Group Segment</label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {Object.values(TargetGroup).map(group => (
                       <button
                         key={group}
                         type="button"
                         onClick={() => setProgramForm({...programForm, dedicatedFor: group})}
                         className={`flex items-center gap-4 p-5 rounded-[28px] border transition-all text-left ${programForm.dedicatedFor === group ? 'bg-blue-600 border-blue-500 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-100 hover:bg-slate-50'}`}
                       >
                         <div className={`p-2 rounded-xl ${programForm.dedicatedFor === group ? 'bg-white/20' : 'bg-slate-100'}`}>
                           {getTargetIcon(group as string)}
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-widest leading-tight">{group}</span>
                         </div>
                       </button>
                     ))}
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Core Objective</label>
                   <textarea value={programForm.objective || ''} onChange={e => setProgramForm({...programForm, objective: e.target.value})} className="w-full h-32 px-6 py-5 bg-slate-50 border border-slate-200 rounded-[28px] font-medium text-sm outline-none resize-none leading-relaxed shadow-inner" placeholder="Describe the clinical or educational outcome expected..." />
                </div>
                <div className="pt-8 border-t flex gap-4">
                   <button type="button" onClick={() => setIsProgramModalOpen(false)} className="flex-1 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 rounded-[28px] transition-all">Discard</button>
                   <button type="submit" className="flex-1 py-5 bg-blue-600 text-white rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-700 active:scale-95 transition-all">
                     <Save size={18}/> Commit Catalog Template
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminNavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 shrink-0 ${active ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:text-slate-600 shadow-sm'}`}><span className="mr-3">{icon}</span>{label}</button>
);

const ReviewField: React.FC<{ label: string; value: string | number; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="space-y-1">
     <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
     <p className={`text-sm font-black uppercase tracking-tighter ${highlight ? 'text-blue-600' : 'text-slate-900'}`}>{value}</p>
  </div>
);

export default AdminPanel;
