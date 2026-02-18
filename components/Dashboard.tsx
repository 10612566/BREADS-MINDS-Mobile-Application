
import React, { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { 
  Users, 
  Target, 
  Activity, 
  Calendar, 
  MapPin, 
  ArrowUpRight, 
  Bell, 
  Info, 
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  CalendarDays,
  Medal,
  Zap,
  Award,
  Layers,
  ChevronDown,
  Layout
} from 'lucide-react';
import { BeneficiaryReport, User, Role, TargetGroup, District, Notice, NoticePriority } from '../types';
import { TARGET_ANNUAL } from '../constants';

interface DashboardProps {
  reports: BeneficiaryReport[];
  user: User;
  districts: District[];
  notices: Notice[];
  onViewReport: () => void;
}

// Gantt Parameter Mapping for 2026 Roadmap
const ROADMAP_TASKS = [
  { id: 1, name: 'Specialized Art/Talent Therapy Workshops', schedule: [3, 6, 9, 12], color: 'bg-pink-500' },
  { id: 2, name: 'Workshops for Teachers and Volunteers', schedule: [2, 5, 8, 11], color: 'bg-purple-500' },
  { id: 3, name: 'Parental Training Workshops', schedule: [1, 4, 7, 10], color: 'bg-indigo-500' },
  { id: 4, name: 'School/Community-wide Awareness Campaigns', schedule: [3, 4, 9, 10], color: 'bg-orange-500' },
  { id: 5, name: 'Mentors Training', schedule: [1, 7], color: 'bg-amber-500' },
  { id: 6, name: 'Counseling Services Setup (Centers/Online)', schedule: [1, 2], color: 'bg-slate-700' },
  { id: 7, name: 'Counseling Sessions (Ongoing)', schedule: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12], color: 'bg-emerald-500' },
  { id: 8, name: 'Helpline and Online Support Platform', schedule: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], color: 'bg-blue-600' },
  { id: 9, name: 'Evaluation and Feedback Collection', schedule: [6, 12], color: 'bg-rose-500' },
  { id: 10, name: 'Partnerships & Advocacy', schedule: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], color: 'bg-cyan-500' },
];

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Dashboard: React.FC<DashboardProps> = ({ reports, user, districts, notices, onViewReport }) => {
  const isDC = user.role === Role.DISTRICT_COORDINATOR;
  const [drillDownGroup, setDrillDownGroup] = useState<TargetGroup | null>(null);
  
  const filteredReports = useMemo(() => {
    return isDC ? reports.filter(r => r.districtId === user.districtId) : reports;
  }, [reports, isDC, user.districtId]);

  const activeNotices = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return notices.filter(n => {
      const isInRole = n.targetRoles.includes(user.role);
      const isGenerallyActive = n.isActive;
      const matchesDate = (!n.startDate || today >= n.startDate) && 
                          (!n.endDate || today <= n.endDate);
      return isInRole && isGenerallyActive && matchesDate;
    });
  }, [notices, user.role]);

  const topDistricts = useMemo(() => {
    const districtImpactMap: Record<string, number> = {};
    reports.forEach(r => {
      const childrenReached = (r.targetsReached[TargetGroup.CHILDREN] as number) || 0;
      districtImpactMap[r.districtId] = (districtImpactMap[r.districtId] || 0) + childrenReached;
    });

    return Object.entries(districtImpactMap)
      .map(([distId, totalReached]) => ({
        id: distId,
        name: districts.find(d => d.id === distId)?.name || 'Unknown',
        reached: totalReached
      }))
      .sort((a, b) => b.reached - a.reached)
      .slice(0, 3);
  }, [reports, districts]);

  const activityTrendData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const monthlyActivityMap: Record<string, number> = {};

    filteredReports
      .filter(r => r.year === currentYear)
      .forEach(r => {
        const totalActivities = (Object.values(r.activities) as number[]).reduce((sum, val) => sum + val, 0);
        monthlyActivityMap[r.month] = (monthlyActivityMap[r.month] || 0) + totalActivities;
      });

    return Object.entries(monthlyActivityMap)
      .map(([month, value]) => ({ month: month.split('-')[1], fullMonth: month, value }))
      .sort((a, b) => a.fullMonth.localeCompare(b.fullMonth));
  }, [filteredReports]);

  const stats = useMemo(() => {
    const totals: Record<string, number> = {
      [TargetGroup.CHILDREN]: 0,
      [TargetGroup.PARENTS]: 0,
      [TargetGroup.TEACHERS]: 0,
      sessions: 0,
      campaigns: 0
    };
    filteredReports.forEach(r => {
      totals[TargetGroup.CHILDREN] += (r.targetsReached[TargetGroup.CHILDREN] as number) || 0;
      totals[TargetGroup.PARENTS] += (r.targetsReached[TargetGroup.PARENTS] as number) || 0;
      totals[TargetGroup.TEACHERS] += (r.targetsReached[TargetGroup.TEACHERS] as number) || 0;
      totals.sessions += (r.activities.counsellingSessions as number) || 0;
      totals.campaigns += (r.activities.campaigns as number) || 0;
    });
    return totals;
  }, [filteredReports]);

  const barData = useMemo(() => {
    const groups = [TargetGroup.CHILDREN, TargetGroup.PARENTS, TargetGroup.TEACHERS];
    return groups.map(g => ({
      name: g.split(' ')[0],
      fullName: g,
      reached: stats[g] || 0,
      target: TARGET_ANNUAL[g as TargetGroup] / 12
    }));
  }, [stats]);

  const drillDownData = useMemo(() => {
    if (!drillDownGroup) return [];
    
    const monthlyMap = new Map<string, number>();
    filteredReports.forEach(r => {
      const current = monthlyMap.get(r.month) || 0;
      monthlyMap.set(r.month, current + ((r.targetsReached[drillDownGroup] as number) || 0));
    });

    return Array.from(monthlyMap.entries())
      .map(([month, val]) => ({
        month,
        value: val
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [drillDownGroup, filteredReports]);

  const handleBarClick = (data: any) => {
    if (data && data.fullName) {
      setDrillDownGroup(data.fullName as TargetGroup);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Board Section */}
      {activeNotices.length > 0 && (
        <div className="bg-white rounded-[32px] border p-6 shadow-sm border-amber-100 overflow-hidden relative animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center space-x-3 mb-4">
             <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <Bell size={18} className="animate-bounce" />
             </div>
             <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Notice Board</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeNotices.map(notice => (
              <div key={notice.id} className={`p-5 rounded-2xl border flex items-start space-x-4 transition-all hover:shadow-md ${
                notice.priority === NoticePriority.CRITICAL ? 'bg-red-50 border-red-100' :
                notice.priority === NoticePriority.HIGH ? 'bg-amber-50 border-amber-100' :
                'bg-blue-50/30 border-blue-50'
              }`}>
                <div className={`p-2 rounded-xl mt-1 ${
                  notice.priority === NoticePriority.CRITICAL ? 'bg-red-100 text-red-600' :
                  notice.priority === NoticePriority.HIGH ? 'bg-amber-100 text-amber-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {notice.priority === NoticePriority.CRITICAL ? <AlertTriangle size={18} /> : <Info size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-900 text-sm truncate">{notice.title}</h4>
                  <p className="text-slate-600 text-xs mt-1 font-medium leading-relaxed">{notice.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <StatCard icon={<Users className="text-blue-600" size={24} />} label="Children Reached" value={(stats[TargetGroup.CHILDREN] || 0).toLocaleString()} />
        <StatCard icon={<Target className="text-purple-600" size={24} />} label="Parent Training" value={(stats[TargetGroup.PARENTS] || 0).toLocaleString()} />
        <StatCard icon={<Activity className="text-pink-600" size={24} />} label="Sessions" value={(stats.sessions || 0).toLocaleString()} />
        <StatCard icon={<MapPin className="text-orange-600" size={24} />} label="Campaigns" value={(stats.campaigns || 0).toString()} />
      </div>

      {/* GANTT CHART SECTION: Project Implementation Roadmap */}
      <div className="bg-white rounded-[40px] border p-10 shadow-sm animate-in fade-in zoom-in-95 duration-700">
         <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                  <Layout size={24} />
               </div>
               <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Implementation Roadmap</h3>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">Project Activity Schedule 2026</p>
               </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border rounded-xl">
               <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Cycle Tracking</span>
            </div>
         </div>

         <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[1000px] space-y-4">
               {/* Month Headers */}
               <div className="grid grid-cols-12 gap-1 mb-6 px-4 ml-[260px]">
                  {MONTHS_SHORT.map((m, i) => (
                     <div key={m} className="text-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{m}</span>
                        <div className="h-2 w-px bg-slate-100 mx-auto mt-2"></div>
                     </div>
                  ))}
               </div>

               {/* Tasks */}
               {ROADMAP_TASKS.map((task) => (
                  <div key={task.id} className="flex items-center group">
                     <div className="w-[260px] pr-6">
                        <p className="text-[11px] font-black text-slate-700 leading-tight group-hover:text-blue-600 transition-colors">{task.name}</p>
                     </div>
                     <div className="flex-1 grid grid-cols-12 gap-1 relative h-8 bg-slate-50/50 rounded-full border border-slate-50/80 items-center px-4">
                        {Array.from({ length: 12 }).map((_, i) => {
                           const isScheduled = task.schedule.includes(i + 1);
                           return (
                              <div key={i} className="h-full flex items-center justify-center relative">
                                 {isScheduled && (
                                    <div className={`h-4 w-full rounded-full ${task.color} opacity-90 shadow-sm transform transition-all group-hover:scale-y-110`}></div>
                                 )}
                              </div>
                           );
                        })}
                     </div>
                  </div>
               ))}
            </div>
         </div>
         
         <div className="mt-10 flex flex-wrap gap-8 items-center justify-center border-t pt-8">
            <LegendItem color="bg-emerald-500" label="Ongoing Service" />
            <LegendItem color="bg-purple-500" label="Workshop Cycle" />
            <LegendItem color="bg-orange-500" label="Awareness Peak" />
            <LegendItem color="bg-rose-500" label="Quality Audit" />
            <LegendItem color="bg-slate-700" label="Setup Phase" />
         </div>
      </div>

      {/* Main Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievement Metrics */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              {drillDownGroup ? (
                <button onClick={() => setDrillDownGroup(null)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"><ArrowLeft size={18} className="text-slate-400" /></button>
              ) : (
                <div className="p-2 bg-blue-50 rounded-xl"><TrendingUp size={18} className="text-blue-600" /></div>
              )}
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Achievement Metrics</h3>
                <p className="text-lg font-black text-slate-900 tracking-tight">{drillDownGroup ? drillDownGroup : 'Target Distribution'}</p>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            {drillDownGroup ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={drillDownData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                  <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px'}} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                  <Tooltip cursor={{fill: '#f8fafc', radius: 12}} />
                  <Bar dataKey="reached" radius={[12, 12, 0, 0]} onClick={handleBarClick} className="cursor-pointer">
                    {barData.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#8b5cf6'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Activity Stream */}
        <div className="bg-white rounded-[32px] border p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Activity Stream</h3>
            <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Calendar size={18} /></div>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
            {filteredReports.slice(0, 6).map(report => (
              <div key={report.id} className="flex items-center p-4 bg-slate-50/50 hover:bg-white hover:shadow-lg rounded-3xl transition-all group border border-transparent cursor-pointer" onClick={onViewReport}>
                <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center mr-4 group-hover:bg-blue-600 group-hover:text-white transition-all"><Activity size={18} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate">{districts.find(d => d.id === report.districtId)?.name || 'HQ Unit'}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Cycle: {report.month}</p>
                </div>
                <ChevronRight size={18} className="text-slate-200 group-hover:text-blue-600 transition-all" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-3">
    <div className={`w-3 h-3 rounded-full ${color}`}></div>
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
  </div>
);

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-white rounded-[32px] border p-8 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group cursor-default">
    <div className="flex items-start justify-between">
      <div className={`w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>{icon}</div>
      <ArrowUpRight size={14} className="text-slate-300" />
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{label}</p>
    <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
  </div>
);

export default Dashboard;
