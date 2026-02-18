
import React, { useState, useMemo } from 'react';
import { User, Role, TargetGroup, BeneficiaryReport, District } from '../types';
import { 
  Lock,
  Plus,
  Minus,
  Save,
  AlertCircle,
  History,
  Users,
  Calendar,
  ChevronRight,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface DataEntryFormProps {
  user: User;
  districts: District[];
  onSubmit: (report: BeneficiaryReport) => void;
  isLocked: boolean;
  reports: BeneficiaryReport[];
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({ user, districts, onSubmit, isLocked, reports }) => {
  const [formData, setFormData] = useState({
    month: new Date().toISOString().substring(0, 7),
    targets: {
      [TargetGroup.CHILDREN]: 0,
      [TargetGroup.PARENTS]: 0,
      [TargetGroup.PROFESSIONALS]: 0,
      [TargetGroup.TEACHERS]: 0,
      [TargetGroup.VOLUNTEERS]: 0,
    },
    activities: {
      educationModules: 0,
      campaigns: 0,
      therapyWorkshops: 0,
      counsellingSessions: 0,
      parentalTraining: 0
    },
    narrative: ''
  });

  // Filter reports for the current logged-in user's district
  const myRecentReports = useMemo(() => {
    return reports
      .filter(r => r.districtId === user.districtId)
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 5);
  }, [reports, user.districtId]);

  const alreadySubmitted = useMemo(() => {
    return reports.some(r => r.districtId === user.districtId && r.month === formData.month);
  }, [reports, user.districtId, formData.month]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || alreadySubmitted || !user.districtId) return;

    const report: BeneficiaryReport = {
      id: Math.random().toString(36).substr(2, 9),
      districtId: user.districtId,
      month: formData.month,
      year: parseInt(formData.month.split('-')[0]),
      submittedAt: new Date().toISOString(),
      submittedBy: user.name,
      targetsReached: formData.targets,
      activities: formData.activities,
      narrativeImpact: formData.narrative,
      isLocked: false
    };

    onSubmit(report);
  };

  const updateTarget = (group: TargetGroup, val: number) => {
    setFormData(prev => ({ ...prev, targets: { ...prev.targets, [group]: Math.max(0, val) } }));
  };

  const assignedDistrictName = districts.find(d => d.id === user.districtId)?.name || 'HQ';

  if (isLocked && user.role === Role.DISTRICT_COORDINATOR) {
    return (
      <div className="bg-white rounded-3xl border border-red-100 p-12 text-center shadow-xl max-w-2xl mx-auto">
        <Lock size={48} className="mx-auto text-red-500 mb-8" />
        <h2 className="text-2xl font-black mb-3">Reporting Window Closed</h2>
        <p className="text-slate-500">The cycle lock for this period is active. Contact HQ for manual overrides.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-[40px] border p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 rounded-[24px] text-white shadow-lg shadow-blue-200">
              <FileText size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Monthly Performance Log</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Beneficiary Outreach Data</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Selected District</span>
            <span className="text-lg font-black text-blue-600">{assignedDistrictName}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[32px] border p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Target Reached</h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border rounded-lg">
                  <Calendar size={12} className="text-slate-400" />
                  <input 
                    type="month" 
                    value={formData.month} 
                    onChange={e => setFormData({...formData, month: e.target.value})} 
                    className="bg-transparent text-[10px] font-black uppercase outline-none" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.values(TargetGroup).map(group => (
                  <div key={group} className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{group}</label>
                    <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl p-1 h-[56px] shadow-sm">
                      <button type="button" onClick={() => updateTarget(group, formData.targets[group] - 1)} className="w-12 h-full flex items-center justify-center font-bold text-slate-300 hover:text-blue-600 transition-colors">
                        <Minus size={16} />
                      </button>
                      <input 
                        type="number" 
                        value={formData.targets[group]} 
                        onChange={e => updateTarget(group, parseInt(e.target.value) || 0)} 
                        className="flex-1 bg-transparent text-center font-black text-sm outline-none no-spinner" 
                      />
                      <button type="button" onClick={() => updateTarget(group, formData.targets[group] + 1)} className="w-12 h-full flex items-center justify-center font-bold text-slate-300 hover:text-blue-600 transition-colors">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[32px] border p-8 shadow-sm">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Narrative Impact Summary</label>
              <textarea 
                value={formData.narrative} 
                onChange={e => setFormData({...formData, narrative: e.target.value})} 
                className="w-full h-40 bg-slate-50 border border-slate-100 rounded-[24px] p-6 outline-none font-medium text-xs resize-none focus:ring-4 focus:ring-blue-50 transition-all" 
                placeholder="Describe key highlights, success stories, or challenges from this month's intervention..."
              />
            </div>

            <button 
              type="submit" 
              disabled={alreadySubmitted} 
              className="w-full py-6 bg-blue-600 text-white rounded-[28px] font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Save size={18} />
              {alreadySubmitted ? 'Cycle Already Logged' : 'Commit Monthly Data'}
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-[32px] border p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Submission History</h3>
                <History size={18} className="text-slate-200" />
              </div>
              
              <div className="space-y-4">
                {myRecentReports.map(report => (
                  <div key={report.id} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all cursor-default">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{new Date(report.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Children</span>
                        <span className="text-sm font-black text-slate-900">{report.targetsReached[TargetGroup.CHILDREN]}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Parents</span>
                        <span className="text-sm font-black text-slate-900">{report.targetsReached[TargetGroup.PARENTS]}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {myRecentReports.length === 0 && (
                  <div className="py-12 text-center opacity-30">
                    <History size={32} className="mx-auto mb-2" />
                    <p className="text-[9px] font-black uppercase tracking-widest">No previous logs</p>
                  </div>
                )}
              </div>
            </div>

            {alreadySubmitted && (
              <div className="bg-amber-50 border border-amber-100 rounded-[32px] p-8 flex items-start gap-4 animate-in fade-in slide-in-from-right-4">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-600 shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-tight">Record Exists</h4>
                  <p className="text-[10px] font-medium text-amber-700 leading-relaxed mt-1">A report for {formData.month} has already been committed to the master database. Please use the Reports tab to edit existing records.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default DataEntryForm;
