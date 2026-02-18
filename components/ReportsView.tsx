
import React, { useState, useMemo } from 'react';
import { BeneficiaryReport, User, Role, District, Area, TargetGroup, SchoolProposal, ProposalStatus, School, SchoolMonthlyReport, MonthlyPlanItem, MindsActivityRecord } from '../types';
import { jsPDF } from 'jspdf';
import { 
  Search, 
  Eye, 
  X,
  Download,
  Pencil,
  CheckCircle2,
  TrendingUp,
  Users,
  Heart,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Activity,
  Calendar,
  Send,
  Unlock as UnlockIcon,
  Lock,
  Loader2,
  Plus,
  Minus,
  AlertCircle,
  School as SchoolIcon,
  Building2,
  GraduationCap,
  MapPin,
  ClipboardList,
  MessageSquare,
  FileText,
  ListTodo,
  CheckCircle,
  Clock,
  Ban,
  MoreVertical,
  Filter,
  RotateCcw,
  History,
  UserCheck,
  Stethoscope,
  ChevronRight
} from 'lucide-react';

interface ReportsViewProps {
  reports: BeneficiaryReport[];
  schoolMonthlyReports: SchoolMonthlyReport[];
  monthlyPlanItems: MonthlyPlanItem[];
  mindsActivityRecords: MindsActivityRecord[];
  user: User;
  districts: District[];
  areas: Area[];
  schools: School[];
  onUpdate: (report: BeneficiaryReport) => void;
  onAdd?: (report: BeneficiaryReport) => void;
  onAddSchoolReport?: (report: SchoolMonthlyReport) => void;
  onAddMonthlyPlanItem?: (item: MonthlyPlanItem) => void;
  onAddMindsActivityRecord?: (record: MindsActivityRecord) => void;
  isSubmissionLocked: boolean;
  schoolProposals: SchoolProposal[];
}

type ViewMode = 'REACH' | 'ACTIVITIES' | 'SCHOOL_VISITS' | 'MONTHLY_PLAN' | 'ACTIVITY_REPORT';

const ReportsView: React.FC<ReportsViewProps> = ({ 
  reports, 
  schoolMonthlyReports,
  monthlyPlanItems,
  mindsActivityRecords,
  user, 
  districts, 
  areas, 
  schools,
  onUpdate, 
  onAdd, 
  onAddSchoolReport,
  onAddMonthlyPlanItem,
  onAddMindsActivityRecord,
  isSubmissionLocked, 
  schoolProposals 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('REACH');
  
  const [showFilters, setShowFilters] = useState(false);
  const [viewingReachReport, setViewingReachReport] = useState<BeneficiaryReport | null>(null);

  const isBreadsCoordinator = user.role === Role.BREADS_COORDINATOR || user.role === Role.SUPER_ADMIN;
  const isDC = user.role === Role.DISTRICT_COORDINATOR;

  const processedReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = r.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.month.includes(searchTerm);
      const matchesUserScope = isBreadsCoordinator || r.districtId === user.districtId;
      const matchesDistrict = selectedDistrictId === 'All' || r.districtId === selectedDistrictId;
      return matchesSearch && matchesUserScope && matchesDistrict;
    }).sort((a, b) => b.month.localeCompare(a.month));
  }, [reports, searchTerm, isBreadsCoordinator, user.districtId, selectedDistrictId]);

  const processedActivityRecords = useMemo(() => {
    return mindsActivityRecords.filter(r => {
      const matchesSearch = r.childName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.schoolName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUserScope = isBreadsCoordinator || r.districtId === user.districtId;
      const matchesDistrict = selectedDistrictId === 'All' || r.districtId === selectedDistrictId;
      return matchesSearch && matchesUserScope && matchesDistrict;
    }).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }, [mindsActivityRecords, searchTerm, isBreadsCoordinator, user.districtId, selectedDistrictId]);

  const activeSchools = useMemo(() => {
    const districtScopedSchools = schools.filter(s => isBreadsCoordinator || s.districtId === user.districtId);
    return districtScopedSchools;
  }, [schools, user.districtId, isBreadsCoordinator]);

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      <div className="bg-white rounded-[40px] border p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Project Intelligence</h3>
            <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">Audit & Review Portal</p>
          </div>
          
          <div className="flex flex-wrap justify-center bg-slate-50 p-1.5 rounded-[24px] overflow-hidden">
            {[
              { id: 'REACH', label: 'Impact Reach', icon: <TrendingUp size={14}/> },
              { id: 'ACTIVITY_REPORT', label: 'Activity Logs', icon: <Stethoscope size={14}/> },
              { id: 'SCHOOL_VISITS', label: 'School Visits', icon: <SchoolIcon size={14}/> },
              { id: 'MONTHLY_PLAN', label: 'Action Plans', icon: <ListTodo size={14}/> }
            ].map((mode) => (
              <button 
                key={mode.id} 
                onClick={() => setViewMode(mode.id as ViewMode)} 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === mode.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {mode.icon}
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-md items-center sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="flex-1 relative w-full lg:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={`Search ${viewMode === 'ACTIVITY_REPORT' ? 'by child/school...' : 'by month/coordinator...'}`}
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50/50 font-medium transition-all" 
          />
        </div>
        
        {isBreadsCoordinator && (
          <select 
            value={selectedDistrictId} 
            onChange={e => setSelectedDistrictId(e.target.value)}
            className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer"
          >
            <option value="All">All Districts</option>
            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        )}
      </div>

      {viewMode === 'REACH' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {processedReports.map(report => (
            <div key={report.id} className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 tracking-tight">{new Date(report.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{districts.find(d => d.id === report.districtId)?.name || 'HQ Unit'}</p>
                  </div>
                </div>
                <div className={`p-2 rounded-xl ${report.isLocked ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-600'}`}>
                  {report.isLocked ? <Lock size={16}/> : <CheckCircle2 size={16}/>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block mb-1">Children</span>
                    <span className="text-xl font-black text-slate-900">{report.targetsReached[TargetGroup.CHILDREN]}</span>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block mb-1">Parents</span>
                    <span className="text-xl font-black text-slate-900">{report.targetsReached[TargetGroup.PARENTS]}</span>
                 </div>
              </div>

              <div className="flex-1">
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic line-clamp-3">
                  "{report.narrativeImpact}"
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">By: {report.submittedBy}</span>
                <button 
                  onClick={() => setViewingReachReport(report)}
                  className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:translate-x-1 transition-transform"
                >
                  View Details <ChevronRight size={14}/>
                </button>
              </div>
            </div>
          ))}

          {processedReports.length === 0 && (
            <div className="col-span-full py-32 text-center bg-white rounded-[40px] border border-dashed flex flex-col items-center">
              <History size={48} className="text-slate-100 mb-4" />
              <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">No impact records found</p>
            </div>
          )}
        </div>
      )}

      {viewMode === 'ACTIVITY_REPORT' && (
        <div className="bg-white rounded-[40px] border overflow-hidden shadow-sm overflow-x-auto no-scrollbar animate-in fade-in">
           <table className="w-full text-left min-w-[1200px]">
             <thead className="bg-slate-50 border-b">
               <tr>
                 <th className="px-6 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Child Name</th>
                 <th className="px-6 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">School</th>
                 <th className="px-6 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Intervention</th>
                 <th className="px-6 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest text-center">Sessions</th>
                 <th className="px-6 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">District</th>
                 <th className="px-6 py-4 text-right text-[9px] font-black uppercase text-slate-400 tracking-widest">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {processedActivityRecords.map(record => (
                 <tr key={record.id} className="group hover:bg-slate-50/50 transition-colors">
                   <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900">{record.childName}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{record.gender} • {record.age}y</span>
                      </div>
                   </td>
                   <td className="px-6 py-5 text-xs font-black text-blue-600">{record.schoolName}</td>
                   <td className="px-6 py-5 text-[10px] font-black uppercase">{record.interventionType}</td>
                   <td className="px-6 py-5">
                      <div className="flex justify-center gap-1">
                         {[record.session1Date, record.session2Date, record.session3Date].map((d, i) => (
                           <div key={i} className={`w-2 h-2 rounded-full ${d ? 'bg-emerald-500' : 'bg-slate-200'}`} title={d || 'Pending'}></div>
                         ))}
                      </div>
                   </td>
                   <td className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">{districts.find(d => d.id === record.districtId)?.name}</td>
                   <td className="px-6 py-5 text-right">
                     <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><Eye size={16}/></button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      )}

      {viewingReachReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[85vh]">
            <div className="px-10 py-8 border-b bg-slate-50 flex items-center justify-between">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Report Review</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{districts.find(d => d.id === viewingReachReport.districtId)?.name} • {viewingReachReport.month}</p>
               </div>
               <button onClick={() => setViewingReachReport(null)} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors"><X size={20}/></button>
            </div>
            <div className="p-10 overflow-y-auto no-scrollbar space-y-8">
               <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {Object.entries(viewingReachReport.targetsReached).map(([group, val]) => (
                    <div key={group} className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                       <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block mb-1">{group}</span>
                       <span className="text-xl font-black text-blue-600">{val as number}</span>
                    </div>
                  ))}
               </div>
               
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Activities Conducted</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(viewingReachReport.activities).map(([act, val]) => (
                      <div key={act} className="p-4 bg-blue-50/30 rounded-2xl border border-blue-50">
                        <span className="text-[8px] font-black uppercase text-blue-400 block mb-1">{act.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-lg font-black text-blue-600">{val as number}</span>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Narrative Impact
                  </h4>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed italic">
                    "{viewingReachReport.narrativeImpact}"
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}

      {(viewMode === 'SCHOOL_VISITS' || viewMode === 'MONTHLY_PLAN') && (
        <div className="py-40 text-center bg-white rounded-[40px] border border-dashed flex flex-col items-center">
          <Clock size={48} className="text-slate-100 mb-4" />
          <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">{viewMode.replace('_', ' ')} Module Coming Soon</p>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
