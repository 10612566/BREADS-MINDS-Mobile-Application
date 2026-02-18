
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Role, User, BeneficiaryReport, TargetGroup, UserStatus, Area, District, Notice, School, HealthProgram, SchoolProposal, ProposalStatus, SchoolMonthlyReport, MonthlyPlanItem, SystemLog, MindsActivityRecord, ServiceRequest, NoticePriority, ServiceRequestCategory } from './types';
import { NAVIGATION_ITEMS, TARGET_ANNUAL } from './constants';
import { 
  LogOut, 
  BrainCircuit, 
  Loader2,
  ChevronRight,
  Clock,
  CloudCheck,
  RefreshCw,
  Menu,
  X,
  User as UserIcon,
  Settings,
  Mail,
  Phone,
  UserCircle,
  Save,
  Camera,
  RotateCw,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { database } from './services/database';
import Dashboard from './components/Dashboard';
import DataEntryForm from './components/DataEntryForm';
import ReportsView from './components/ReportsView';
import AdminPanel from './components/AdminPanel';
import ServiceRequests from './components/ServiceRequests';

const App: React.FC = () => {
  // Application State
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // Data State
  const [areas, setAreas] = useState<Area[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolProposals, setSchoolProposals] = useState<SchoolProposal[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [schoolMonthlyReports, setSchoolMonthlyReports] = useState<SchoolMonthlyReport[]>([]);
  const [monthlyPlanItems, setMonthlyPlanItems] = useState<MonthlyPlanItem[]>([]);
  const [mindsActivityRecords, setMindsActivityRecords] = useState<MindsActivityRecord[]>([]);
  const [healthPrograms, setHealthPrograms] = useState<HealthProgram[]>([]);
  const [users, setUsers] = useState<(User & { username: string; password: string })[]>([]);
  const [reports, setReports] = useState<BeneficiaryReport[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [deadlineDay, setDeadlineDay] = useState<number>(5);
  const [annualTargets, setAnnualTargets] = useState<Record<TargetGroup, number>>(TARGET_ANNUAL);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      try {
        const data = await database.initialize();
        setAreas(data.areas);
        setDistricts(data.districts);
        setSchools(data.schools);
        setSchoolProposals(data.proposals);
        setServiceRequests(data.serviceRequests || []);
        setSchoolMonthlyReports(data.schoolMonthlyReports || []);
        setMonthlyPlanItems(data.monthlyPlanItems || []);
        setMindsActivityRecords(data.mindsActivityRecords || []);
        setHealthPrograms(data.programs);
        setUsers(data.users);
        setReports(data.reports);
        setNotices(data.notices);
        setSystemLogs(data.systemLogs || []);
        setDeadlineDay(data.settings.deadlineDay || 5);
        if (data.settings.annualTargets && Object.keys(data.settings.annualTargets).length > 0) {
          setAnnualTargets(data.settings.annualTargets as Record<TargetGroup, number>);
        }
      } catch (error) {
        console.error("Failed to initialize database:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  const wrapSync = async (fn: () => Promise<void>) => {
    setIsSyncing(true);
    try {
      await fn();
    } catch (error) {
      console.error("Database Sync Error:", error);
      alert("System failed to sync changes. Please check your connection.");
    } finally {
      setIsSyncing(false);
    }
  };

  const deadlineInfo = useMemo(() => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const isLocked = dayOfMonth > deadlineDay;
    const daysRemaining = deadlineDay - today.getDate();
    return { isLocked, daysRemaining };
  }, [deadlineDay]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const usernameInput = (form.elements.namedItem('username') as HTMLInputElement);
    const passwordInput = (form.elements.namedItem('password') as HTMLInputElement);
    
    if (!usernameInput || !passwordInput) return;

    const authenticatedUser = users.find(u => u.username === usernameInput.value && u.password === passwordInput.value);
    if (authenticatedUser) {
      setUser({ 
        id: authenticatedUser.id, 
        name: authenticatedUser.name, 
        role: authenticatedUser.role, 
        status: authenticatedUser.status, 
        districtId: authenticatedUser.districtId, 
        email: authenticatedUser.email, 
        mobile: authenticatedUser.mobile,
        photo: authenticatedUser.photo 
      });
    } else {
      alert('Invalid credentials.');
    }
  };

  const handleUpdateUsers = (newUsers: (User & { username: string; password: string })[]) => {
    setUsers(newUsers);
    wrapSync(() => database.saveUsers(newUsers));
  };

  const handleUpdateProfile = (updatedProfile: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updatedProfile };
    setUser(updatedUser);
    
    const updatedUsers = users.map(u => 
      u.id === user.id ? { ...u, ...updatedProfile } : u
    );
    setUsers(updatedUsers);
    wrapSync(() => database.saveUsers(updatedUsers));
    setIsProfileModalOpen(false);
    setIsProfileMenuOpen(false);
  };

  const handleAddReport = (newReport: BeneficiaryReport) => {
    const updated = [newReport, ...reports];
    setReports(updated);
    wrapSync(() => database.saveReports(updated));
    setActiveTab('reports');
  };

  const handleAddServiceRequest = (newRequest: ServiceRequest) => {
    const updated = [newRequest, ...serviceRequests];
    setServiceRequests(updated);
    
    const notice: Notice = {
      id: `not-sr-${Date.now()}`,
      title: 'New Service Request',
      message: `District Coordinator ${newRequest.requestedByName} has submitted a new ${newRequest.category} request.`,
      priority: NoticePriority.HIGH,
      targetRoles: [Role.BREADS_COORDINATOR, Role.SUPER_ADMIN],
      createdAt: new Date().toISOString(),
      createdBy: 'System Monitor',
      isActive: true
    };
    const updatedNotices = [notice, ...notices];
    setNotices(updatedNotices);

    wrapSync(async () => {
      await database.saveServiceRequests(updated);
      await database.saveNotices(updatedNotices);
    });
  };

  const handleResolveServiceRequest = (requestId: string, action: 'APPROVE' | 'REJECT', remarks?: string) => {
    const request = serviceRequests.find(r => r.id === requestId);
    if (!request) return;

    const newStatus = action === 'APPROVE' ? ProposalStatus.APPROVED : ProposalStatus.REJECTED;
    const updatedRequests = serviceRequests.map(r => 
      r.id === requestId ? { ...r, status: newStatus, remarks } : r
    );
    
    setServiceRequests(updatedRequests);

    let updatedSchools = [...schools];
    const isSchoolSelection = request.category === ServiceRequestCategory.SCHOOL_SELECTION;

    if (action === 'APPROVE' && isSchoolSelection && request.schoolSelectionData) {
      const data = request.schoolSelectionData;
      const newSchool: School = {
        id: `s-${Date.now()}`,
        name: data.schoolName,
        districtId: request.districtId,
        taluka: data.taluka,
        schoolCategory: data.schoolCategory,
        overallSuitability: data.overallSuitability
      };
      updatedSchools.push(newSchool);
      setSchools(updatedSchools);
    }

    wrapSync(async () => {
      await database.saveServiceRequests(updatedRequests);
      if (action === 'APPROVE' && isSchoolSelection) {
        await database.saveHierarchy(areas, districts, updatedSchools);
      }
    });
  };

  const handleUpdateServiceRequests = (updatedRequests: ServiceRequest[]) => {
    setServiceRequests(updatedRequests);
    wrapSync(() => database.saveServiceRequests(updatedRequests));
  };

  const handleAddSchoolReport = (newReport: SchoolMonthlyReport) => {
    const updated = [newReport, ...schoolMonthlyReports];
    setSchoolMonthlyReports(updated);
    wrapSync(() => database.saveSchoolMonthlyReports(updated));
  };

  const handleAddMonthlyPlanItem = (newItem: MonthlyPlanItem) => {
    const updated = [newItem, ...monthlyPlanItems];
    setMonthlyPlanItems(updated);
    wrapSync(() => database.saveMonthlyPlanItems(updated));
  };

  const handleAddMindsActivityRecord = (newRecord: MindsActivityRecord) => {
    const updated = [newRecord, ...mindsActivityRecords];
    setMindsActivityRecords(updated);
    wrapSync(() => database.saveMindsActivityRecords(updated));
  };

  const updateReport = (updatedReport: BeneficiaryReport) => {
    const updated = reports.map(r => r.id === updatedReport.id ? updatedReport : r);
    setReports(updated);
    wrapSync(() => database.saveReports(updated));
  };

  const handleUpdateAreas = (newAreas: Area[]) => {
    setAreas(newAreas);
    wrapSync(() => database.saveHierarchy(newAreas, districts, schools));
  };

  const handleUpdateDistricts = (newDistricts: District[]) => {
    setDistricts(newDistricts);
    wrapSync(() => database.saveHierarchy(areas, newDistricts, schools));
  };

  const handleUpdateSchools = (newSchools: School[]) => {
    setSchools(newSchools);
    wrapSync(() => database.saveHierarchy(areas, districts, newSchools));
  };

  const handleUpdateHealthPrograms = (newPrograms: HealthProgram[]) => {
    setHealthPrograms(newPrograms);
    wrapSync(() => database.saveCatalog(newPrograms));
  };

  const handleUpdateNotices = (newNotices: Notice[]) => {
    setNotices(newNotices);
    wrapSync(() => database.saveNotices(newNotices));
  };

  const handleUpdateTargets = (newTargets: Record<TargetGroup, number>) => {
    setAnnualTargets(newTargets);
    wrapSync(() => database.saveSettings({ deadlineDay, annualTargets: newTargets }));
  };

  const handleDeadlineChange = (day: number) => {
    setDeadlineDay(day);
    wrapSync(() => database.saveSettings({ deadlineDay: day, annualTargets }));
  };

  const handleApproveProposal = (proposal: SchoolProposal, remarks: string) => {
    const updatedProposals = schoolProposals.map(p => 
      p.id === proposal.id ? { ...p, status: ProposalStatus.APPROVED, remarks } : p
    );
    setSchoolProposals(updatedProposals);
    const newSchool: School = { id: `s-auto-${Date.now()}`, name: proposal.schoolName, districtId: proposal.districtId };
    const updatedSchools = [...schools, newSchool];
    setSchools(updatedSchools);
    wrapSync(async () => {
      await database.saveProposals(updatedProposals);
      await database.saveHierarchy(areas, districts, updatedSchools);
    });
  };

  const handleRejectProposal = (proposalId: string, remarks: string) => {
    const updated = schoolProposals.map(p => p.id === proposalId ? { ...p, status: ProposalStatus.REJECTED, remarks } : p);
    setSchoolProposals(updated);
    wrapSync(() => database.saveProposals(updated));
  };

  const handleResetDatabase = async () => {
    if (!user || user.role !== Role.SUPER_ADMIN) {
      alert("Unauthorized: Only Super Admin can perform a factory reset.");
      return;
    }
    
    if (confirm("This will PERMANENTLY delete all records except system logs. Continue?")) {
      setIsInitializing(true);
      
      const newLog: SystemLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        performedBy: user.name,
        action: 'FACTORY_RESET',
        details: 'Full system database purge initiated by Super Admin. All beneficiaries, reports, and catalog entries cleared.'
      };
      
      const updatedLogs = [newLog, ...systemLogs];
      setSystemLogs(updatedLogs);
      
      await database.saveSystemLogs(updatedLogs);
      await database.resetDatabase();
      window.location.reload();
    }
  };

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Synchronizing Portal Core...</p>
      </div>
    );
  }

  const navItems = NAVIGATION_ITEMS.filter(item => item.roles.includes(user?.role || Role.DISTRICT_COORDINATOR));

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 -left-20 w-72 h-72 bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 space-y-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center">
             <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-3xl mb-6 shadow-sm">
                <BrainCircuit size={40} className="text-blue-600" />
             </div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tighter">MINDS Portal</h1>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">BREADS Mental Health Initiative</p>
          </div>
          <form onSubmit={handleLoginSubmit} className="space-y-5">
             <input name="username" type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} placeholder="Username" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" required />
             <input name="password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" required />
             <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center">
               Sign In
             </button>
          </form>
        </div>
      </div>
    );
  }

  const userInitials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const prettyRole = user.role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col shrink-0">
        <div className="p-6 border-b flex items-center"><BrainCircuit className="text-blue-600 mr-3" size={32} /><h2 className="font-bold text-xl tracking-tighter">MINDS</h2></div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="mr-3">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button onClick={() => { setUser(null); }} className="w-full flex items-center justify-center py-2 text-slate-400 hover:text-red-600 font-bold transition-colors">
            <LogOut size={18} className="mr-2" />Sign Out
          </button>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 bg-white border-b px-4 md:px-8 flex items-center justify-between shrink-0 shadow-sm z-50">
          <div className="flex items-center space-x-2">
            <div className="md:hidden mr-2"><BrainCircuit className="text-blue-600" size={24} /></div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-800">{activeTab.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center space-x-3 md:space-x-6">
            <div className={`flex items-center gap-2 px-2 py-1 md:px-3 md:py-1.5 rounded-xl border transition-all ${isSyncing ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
              {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <CloudCheck size={14} className="text-emerald-500" />}
              <span className="text-[9px] font-black uppercase tracking-widest hidden xs:block">{isSyncing ? 'Syncing...' : 'Synced'}</span>
            </div>
            <div className={`flex items-center px-3 py-1 md:px-4 md:py-1.5 rounded-full border text-[9px] md:text-[10px] font-black uppercase tracking-widest ${deadlineInfo.isLocked ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
              <Clock size={12} className="mr-1 md:mr-2" />
              <span>{deadlineInfo.isLocked ? 'Locked' : `Ends Day ${deadlineDay}`}</span>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 pl-4 border-l border-slate-100 ml-1 hover:bg-slate-50 py-1 transition-colors rounded-lg group"
              >
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-[11px] font-black text-slate-900 truncate max-w-[120px]">{user.name}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{prettyRole}</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-slate-50 flex items-center justify-center text-white text-[10px] font-black shadow-sm shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                  {user.photo ? (
                    <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    userInitials
                  )}
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl z-[100] p-2 animate-in fade-in slide-in-from-top-2">
                  <button 
                    onClick={() => { setIsProfileModalOpen(true); setIsProfileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                  >
                    <Settings size={14} /> Edit Profile
                  </button>
                  <button 
                    onClick={() => { setUser(null); setIsProfileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-xl transition-all border-t border-slate-50 mt-1"
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {isProfileModalOpen && (
          <ProfileModal 
            user={user} 
            onClose={() => setIsProfileModalOpen(false)} 
            onSave={handleUpdateProfile} 
          />
        )}

        <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50/50 scrollbar-hide pb-24 md:pb-8">
          {activeTab === 'dashboard' && <Dashboard reports={reports} user={user} districts={districts} notices={notices} onViewReport={() => setActiveTab('reports')} />}
          {activeTab === 'service-requests' && (
            <ServiceRequests 
              user={user} 
              districts={districts} 
              serviceRequests={serviceRequests} 
              onAddRequest={handleAddServiceRequest}
              onUpdateRequests={handleUpdateServiceRequests}
            />
          )}
          {activeTab === 'data-entry' && <DataEntryForm user={user} districts={districts} onSubmit={handleAddReport} isLocked={deadlineInfo.isLocked} reports={reports} />}
          {activeTab === 'reports' && (
            <ReportsView 
              reports={reports} 
              user={user} 
              districts={districts} 
              areas={areas} 
              schools={schools}
              schoolMonthlyReports={schoolMonthlyReports}
              monthlyPlanItems={monthlyPlanItems}
              mindsActivityRecords={mindsActivityRecords}
              onUpdate={updateReport} 
              onAdd={handleAddReport} 
              onAddSchoolReport={handleAddSchoolReport}
              onAddMonthlyPlanItem={handleAddMonthlyPlanItem}
              onAddMindsActivityRecord={handleAddMindsActivityRecord}
              isSubmissionLocked={deadlineInfo.isLocked} 
              schoolProposals={schoolProposals}
            />
          )}
          {activeTab === 'admin' && (
            <AdminPanel 
              reports={reports} 
              deadlineDay={deadlineDay} 
              onDeadlineChange={handleDeadlineChange}
              users={users}
              onUpdateUsers={handleUpdateUsers}
              annualTargets={annualTargets}
              onUpdateTargets={handleUpdateTargets}
              areas={areas}
              districts={districts}
              schools={schools}
              healthPrograms={healthPrograms}
              onUpdateAreas={handleUpdateAreas}
              onUpdateDistricts={handleUpdateDistricts}
              onUpdateSchools={handleUpdateSchools}
              onUpdateHealthPrograms={handleUpdateHealthPrograms}
              notices={notices}
              onUpdateNotices={handleUpdateNotices}
              currentUser={user}
              schoolProposals={schoolProposals}
              serviceRequests={serviceRequests}
              onUpdateServiceRequests={handleUpdateServiceRequests}
              onResolveServiceRequest={handleResolveServiceRequest}
              onApproveProposal={handleApproveProposal}
              onRejectProposal={handleRejectProposal}
              onResetDatabase={handleResetDatabase}
              systemLogs={systemLogs}
            />
          )}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-2 py-1 flex items-center justify-around z-[100] shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center px-2 py-2 rounded-2xl transition-all duration-300 ${isActive ? 'text-blue-600 scale-110' : 'text-slate-400 opacity-70'}`}>
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-50' : 'bg-transparent'}`}>{React.cloneElement(item.icon as React.ReactElement<any>, { size: 20 })}</div>
              <span className={`text-[8px] font-black uppercase tracking-tighter mt-0.5 ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedProfile: Partial<User>) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email || '',
    mobile: user.mobile || '',
    photo: user.photo || ''
  });
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setCameraError(null);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera API not supported in this environment.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', 
          width: { ideal: 400 }, 
          height: { ideal: 400 } 
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Essential for iOS/Mobile: handle play after src assign
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error("Play error:", e));
        };
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      let errorMsg = "Unable to access camera.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = "Permission Denied: Please enable camera access in your browser settings to take a photo.";
      } else if (err.name === 'NotFoundError') {
        errorMsg = "No camera hardware detected on this device.";
      }
      setCameraError(errorMsg);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        // Match canvas dimensions to actual video output
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Mirror the capture to match the mirrored preview
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setFormData({ ...formData, photo: dataUrl });
        stopCamera();
      }
    }
  };

  const clearPhoto = () => {
    setFormData({ ...formData, photo: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[95vh]">
        <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Edit Profile</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Personal Technical Records</p>
          </div>
          <button onClick={() => { stopCamera(); onClose(); }} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
          
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="w-32 h-32 bg-slate-100 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-slate-300 overflow-hidden ring-4 ring-slate-50">
                {isCameraActive ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover scale-x-[-1]" 
                  />
                ) : formData.photo ? (
                  <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={80} />
                )}
              </div>
              
              <div className="absolute -bottom-2 -right-2 flex gap-2">
                {!isCameraActive ? (
                  <>
                    <button 
                      type="button" 
                      onClick={startCamera}
                      title="Start Camera"
                      className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-blue-700 transition-all active:scale-90"
                    >
                      <Camera size={24} />
                    </button>
                    {formData.photo && (
                      <button 
                        type="button" 
                        onClick={clearPhoto}
                        title="Delete Photo"
                        className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-rose-600 transition-all active:scale-90"
                      >
                        <Trash2 size={24} />
                      </button>
                    )}
                  </>
                ) : (
                  <button 
                    type="button" 
                    onClick={capturePhoto}
                    title="Capture Photo"
                    className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-emerald-600 transition-all animate-pulse active:scale-90"
                  >
                    <RotateCw size={24} />
                  </button>
                )}
              </div>
            </div>
            
            {cameraError ? (
              <div className="mt-4 flex items-start gap-2 p-3 bg-rose-50 rounded-xl border border-rose-100 max-w-[280px]">
                <AlertCircle size={14} className="text-rose-500 mt-0.5 shrink-0" />
                <p className="text-[9px] font-bold text-rose-600 uppercase tracking-tight leading-normal">
                  {cameraError}
                </p>
              </div>
            ) : (
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">
                {user.role.replace(/_/g, ' ')}
              </p>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none focus:ring-4 focus:ring-blue-50/50 shadow-inner" 
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none focus:ring-4 focus:ring-blue-50/50 shadow-inner" 
                  placeholder="name@breads.org"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Mobile Contact</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="tel" 
                  value={formData.mobile} 
                  onChange={e => setFormData({...formData, mobile: e.target.value})}
                  className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none focus:ring-4 focus:ring-blue-50/50 shadow-inner" 
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-8 border-t border-slate-50">
            <button 
              type="button" 
              onClick={() => { stopCamera(); onClose(); }}
              className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all"
            >
              <Save size={14} /> Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
