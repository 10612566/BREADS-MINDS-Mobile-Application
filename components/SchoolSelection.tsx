
import React, { useState, useMemo } from 'react';
import { User, District, SchoolProposal, ProposalStatus } from '../types';
import { jsPDF } from 'jspdf';
import { 
  Building2,
  Navigation,
  Users2,
  ClipboardCheck,
  TrendingUp,
  Save,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Calculator,
  UserCheck,
  Layers,
  Sparkles,
  MapPin,
  CheckCircle2,
  Download,
  Clock,
  History,
  AlertCircle,
  // Added missing imports for UI icons
  Loader2,
  Send
} from 'lucide-react';

interface SchoolSelectionProps {
  user: User;
  districts: District[];
  proposals: SchoolProposal[];
  onPropose: (proposal: SchoolProposal) => void;
}

const DISTRICT_TALUKAS: Record<string, string[]> = {
  'd1': ['Bangalore North', 'Bangalore South', 'Bangalore East', 'Bangalore West', 'Anekal'],
  'd2': ['Chitradurga', 'Challakere', 'Hiriyur', 'Holalkere', 'Hosadurga', 'Molakalmuru'],
  'd3': ['Aurad', 'Basavakalyan', 'Bhalki', 'Bidar', 'Humnabad'],
  'd4': ['Yadgir', 'Shahapur', 'Shorapur', 'Gurmitkal', 'Hunsagi'],
};

const SCHOOL_CATEGORIES = ['Government', 'Aided', 'Unaided', 'Private'];
const SCHOOL_STATUSES = ['Operational', 'New Enrollment', 'Relocated'];
const JUSTIFICATION_TEMPLATES = [
  "School serves a high population of marginalized children with limited access to MH support.",
  "High SDQ scores (Mental Health screening) observed in recent cluster surveys.",
  "Highly proactive administration and active SDMC willing to designate counseling space.",
  "Strategic geographic location serving multiple surrounding villages (Hub model).",
  "Urgent need due to high academic stress and reported dropout trends in the locality."
];

const INITIAL_FORM_STATE = {
  taluka: '',
  gramPanchayat: '',
  villageName: '',
  distanceFromCenter: 0,
  schoolName: '',
  schoolCategory: SCHOOL_CATEGORIES[1],
  schoolStatus: SCHOOL_STATUSES[0],
  completeAddress: '',
  justification: '',
  teachersMale: 0,
  teachersFemale: 0,
  class5Boys: 0, class5Girls: 0,
  class6Boys: 0, class6Girls: 0,
  class7Boys: 0, class7Girls: 0,
  class8Boys: 0, class8Girls: 0,
  class9Boys: 0, class9Girls: 0,
  groupsDivided: 4,
  strengthPerGroup: 0,
  totalEnrollment: 0,
  marginalizedPercentage: 0,
  sdqPercentage: 0,
  academicPerformancePercentage: 0,
  dropoutRatePercentage: 0,
  studentsRequiringSupport: 0,
  hasSchoolCounselor: false,
  schoolCounselorName: '',
  hasSupportStaffSubstitution: false,
  hasProfessionalPartnership: false,
  teachersWillingPercentage: 0,
  proactiveAdministration: false,
  hasPhysicalSpace: false,
  hasBasicAmenities: false,
  amenitiesList: [] as string[],
  isHighRiskRegion: false,
  hasActiveSDMC: false,
  hasStaffInterest: false,
  overallSuitability: 'Medium' as 'High' | 'Medium' | 'Low',
  selectionComments: ''
};

const SchoolSelection: React.FC<SchoolSelectionProps> = ({ user, districts, proposals, onPropose }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [expandedSection, setExpandedSection] = useState<string | null>('identity');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});

  const talukas = useMemo(() => {
    return user.districtId ? (DISTRICT_TALUKAS[user.districtId] || []) : [];
  }, [user.districtId]);

  const assignedDistrict = districts.find(d => d.id === user.districtId);
  const myProposals = proposals.filter(p => p.proposedBy === user.id);

  const totals = useMemo(() => {
    const b = formData.class5Boys + formData.class6Boys + formData.class7Boys + formData.class8Boys + formData.class9Boys;
    const g = formData.class5Girls + formData.class6Girls + formData.class7Girls + formData.class8Girls + formData.class9Girls;
    const teachers = formData.teachersMale + formData.teachersFemale;
    return { b, g, total: b + g, teachers };
  }, [formData]);

  const updateField = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const autoFillAddress = () => {
    const address = `${formData.schoolName}, ${formData.villageName || 'Village'}, ${formData.taluka || 'Taluka'}, ${assignedDistrict?.name || 'District'}`;
    updateField('completeAddress', address);
  };

  const handlePropose = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: boolean } = {};
    
    if (!formData.schoolName.trim()) errors.schoolName = true;
    if (!formData.justification.trim()) errors.justification = true;
    if (!formData.taluka) errors.taluka = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setExpandedSection(errors.schoolName || errors.taluka ? 'identity' : 'rationale');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const proposal: SchoolProposal = {
        ...formData,
        id: `prop-${Date.now()}`,
        districtId: user.districtId!,
        proposedBy: user.id,
        proposedByName: user.name,
        proposedAt: new Date().toISOString(),
        status: ProposalStatus.PENDING,
        teachersTotal: totals.teachers,
        grandTotalBoys: totals.b,
        grandTotalGirls: totals.g,
        grandTotalTotal: totals.total,
        estimatedBeneficiaries: totals.total
      };

      onPropose(proposal);
      setFormData(INITIAL_FORM_STATE);
      setExpandedSection('identity');
      setIsSubmitting(false);
      setFieldErrors({});
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-24">
      <div className="bg-white rounded-[40px] border shadow-sm p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-600 rounded-[24px] text-white shadow-lg shadow-blue-200">
            <Sparkles size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Proposal Engine</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Smart school selection lifecycle</p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="px-5 py-2.5 bg-slate-50 border rounded-2xl flex flex-col items-center">
              <span className="text-[9px] font-black text-slate-400 uppercase">My Proposals</span>
              <span className="text-lg font-black text-slate-900">{myProposals.length}</span>
           </div>
        </div>
      </div>

      <form onSubmit={handlePropose} className="space-y-4">
        <AccordionSection 
          id="identity" title="1. Identity & Location" icon={<Building2 size={18} />} 
          expanded={expandedSection === 'identity'} onToggle={setExpandedSection}
        >
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <InputGroup 
                label="Official School Name *" 
                value={formData.schoolName} 
                onChange={v => updateField('schoolName', v)} 
                error={fieldErrors.schoolName}
                placeholder="Type school name..."
              />
            </div>
            <DropdownGroup 
              label="Taluka (Sub-District) *" 
              options={talukas} 
              value={formData.taluka} 
              onChange={v => updateField('taluka', v)}
              error={fieldErrors.taluka}
            />
            <InputGroup 
              label="Village / Gram Panchayat" 
              value={formData.villageName} 
              onChange={v => updateField('villageName', v)} 
              placeholder="e.g. Hebbal Village"
            />
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Postal Address</label>
                <button 
                  type="button" 
                  onClick={autoFillAddress}
                  className="text-[9px] font-black text-blue-600 uppercase hover:underline"
                >
                  Generate from fields
                </button>
              </div>
              <textarea 
                value={formData.completeAddress} 
                onChange={e => updateField('completeAddress', e.target.value)}
                className="w-full h-24 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-xs resize-none"
                placeholder="Full address details..."
              />
            </div>
            <DropdownGroup label="Institution Category" options={SCHOOL_CATEGORIES} value={formData.schoolCategory} onChange={v => updateField('schoolCategory', v)} />
            <NumericControl label="Distance from DB center (KM)" value={formData.distanceFromCenter} onChange={v => updateField('distanceFromCenter', v)} />
          </div>
        </AccordionSection>

        <AccordionSection 
          id="metrics" title="2. Technical Metrics" icon={<TrendingUp size={18} />} 
          expanded={expandedSection === 'metrics'} onToggle={setExpandedSection}
        >
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <NumericControl label="Total Enrollment" value={formData.totalEnrollment} onChange={v => updateField('totalEnrollment', v)} />
            <NumericControl label="Marginalized Population" value={formData.marginalizedPercentage} onChange={v => updateField('marginalizedPercentage', v)} isPercentage />
            <NumericControl label="Targeted MH Cases" value={formData.sdqPercentage} onChange={v => updateField('sdqPercentage', v)} isPercentage />
            <NumericControl label="Academic Score Avg" value={formData.academicPerformancePercentage} onChange={v => updateField('academicPerformancePercentage', v)} isPercentage />
            <NumericControl label="Recent Dropout Rate" value={formData.dropoutRatePercentage} onChange={v => updateField('dropoutRatePercentage', v)} isPercentage />
            <NumericControl label="Students Needing Therapy" value={formData.studentsRequiringSupport} onChange={v => updateField('studentsRequiringSupport', v)} />
          </div>
        </AccordionSection>

        <AccordionSection 
          id="readiness" title="3. Institutional Readiness" icon={<UserCheck size={18} />} 
          expanded={expandedSection === 'readiness'} onToggle={setExpandedSection}
        >
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ToggleGroup label="Presence of Counselor" value={formData.hasSchoolCounselor} onChange={v => updateField('hasSchoolCounselor', v)} />
              <ToggleGroup label="Substitution Staff Ready" value={formData.hasSupportStaffSubstitution} onChange={v => updateField('hasSupportStaffSubstitution', v)} />
              <ToggleGroup label="Active SDMC/Management" value={formData.hasActiveSDMC} onChange={v => updateField('hasActiveSDMC', v)} />
              <ToggleGroup label="Teacher/Staff interest" value={formData.hasStaffInterest} onChange={v => updateField('hasStaffInterest', v)} />
            </div>
            <NumericControl label="Teachers Willing to Train (%)" value={formData.teachersWillingPercentage} onChange={v => updateField('teachersWillingPercentage', v)} isPercentage />
          </div>
        </AccordionSection>

        <AccordionSection 
          id="rationale" title="4. Final Rationale" icon={<Navigation size={18} />} 
          expanded={expandedSection === 'rationale'} onToggle={setExpandedSection}
        >
          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Selection Justification *</label>
                <span className="text-[9px] font-bold text-blue-500">Pick a template to reduce typing:</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {JUSTIFICATION_TEMPLATES.map((tmpl, idx) => (
                  <button 
                    key={idx} type="button" 
                    onClick={() => updateField('justification', tmpl)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-all"
                  >
                    Template {idx + 1}
                  </button>
                ))}
              </div>
              <textarea 
                value={formData.justification} 
                onChange={e => updateField('justification', e.target.value)}
                className={`w-full h-32 px-5 py-4 bg-slate-50 border ${fieldErrors.justification ? 'border-rose-400' : 'border-slate-100'} rounded-2xl outline-none font-medium text-xs resize-none focus:ring-4 focus:ring-blue-500/10 transition-all`}
                placeholder="Provide professional rationale for selection..."
              />
              {fieldErrors.justification && <p className="text-[9px] font-black text-rose-500 uppercase">Justification is required for HQ review.</p>}
            </div>
            
            <div className="flex gap-4">
               <button 
                 type="submit" 
                 disabled={isSubmitting}
                 className="flex-1 py-5 bg-blue-600 text-white rounded-[28px] font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
               >
                 {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                 Submit Technical Proposal
               </button>
            </div>
          </div>
        </AccordionSection>
      </form>

      {/* History Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Proposal History</h3>
        {myProposals.map(prop => (
          <div key={prop.id} className="bg-white rounded-[32px] border p-6 flex items-center justify-between shadow-sm group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${prop.status === ProposalStatus.APPROVED ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                  {prop.status === ProposalStatus.APPROVED ? <CheckCircle2 size={24}/> : <Clock size={24}/>}
               </div>
               <div>
                  <h4 className="font-black text-slate-900">{prop.schoolName}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{prop.proposedAt.split('T')[0]} • {prop.status}</p>
               </div>
            </div>
            <StatusBadge status={prop.status} />
          </div>
        ))}
        {myProposals.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[40px] border border-dashed flex flex-col items-center">
             <History size={40} className="text-slate-100 mb-4" />
             <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">No previous submissions</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-components
const AccordionSection: React.FC<{ id: string; title: string; icon: React.ReactNode; expanded: boolean; onToggle: (id: string) => void; children: React.ReactNode }> = ({ id, title, icon, expanded, onToggle, children }) => (
  <div className={`bg-white rounded-[32px] border transition-all overflow-hidden ${expanded ? 'ring-4 ring-blue-500/5 shadow-xl border-blue-100' : 'border-slate-100'}`}>
    <button type="button" onClick={() => onToggle(id)} className="w-full px-8 py-6 flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl transition-all ${expanded ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}>{icon}</div>
        <span className={`text-[11px] font-black uppercase tracking-widest ${expanded ? 'text-slate-900' : 'text-slate-500'}`}>{title}</span>
      </div>
      {expanded ? <ChevronUp size={20} className="text-slate-300" /> : <ChevronDown size={20} className="text-slate-300 group-hover:text-blue-500" />}
    </button>
    {expanded && <div className="border-t border-slate-50 animate-in slide-in-from-top-2">{children}</div>}
  </div>
);

const InputGroup: React.FC<{ label: string; value: string; onChange: (v: string) => void; error?: boolean; placeholder?: string }> = ({ label, value, onChange, error, placeholder }) => (
  <div className="space-y-2">
    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${error ? 'text-rose-500' : 'text-slate-400'}`}>{label}</label>
    <div className="relative">
      <input 
        type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full px-5 py-4 bg-slate-50 border ${error ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-100'} rounded-2xl outline-none font-bold text-xs focus:ring-4 focus:ring-blue-500/10 transition-all`}
      />
      {error && <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500" size={18} />}
    </div>
    {error && <p className="text-[9px] font-black text-rose-500 uppercase ml-1">Required field</p>}
  </div>
);

const DropdownGroup: React.FC<{ label: string; options: string[]; value: string; onChange: (v: string) => void; error?: boolean }> = ({ label, options, value, onChange, error }) => (
  <div className="space-y-2">
    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${error ? 'text-rose-500' : 'text-slate-400'}`}>{label}</label>
    <select 
      value={value} onChange={e => onChange(e.target.value)}
      className={`w-full px-5 py-4 bg-slate-50 border ${error ? 'border-rose-400' : 'border-slate-100'} rounded-2xl outline-none font-black text-xs cursor-pointer focus:ring-4 focus:ring-blue-500/10 transition-all`}
    >
      <option value="" disabled>Select option...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const NumericControl: React.FC<{ label: string; value: number; onChange: (v: number) => void; isPercentage?: boolean; error?: boolean }> = ({ label, value, onChange, isPercentage, error }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className={`flex items-center bg-white border ${error ? 'border-rose-400' : 'border-slate-100'} rounded-2xl p-1 shadow-sm h-[56px]`}>
       <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="w-12 h-full flex items-center justify-center text-slate-300 hover:text-blue-600 transition-colors">
         <Minus size={16} />
       </button>
       <div className="flex-1 flex items-center justify-center gap-1">
          <input 
            type="number" value={value} onChange={e => onChange(parseInt(e.target.value) || 0)}
            className="w-12 bg-transparent text-center font-black text-sm outline-none no-spinner"
          />
          {isPercentage && <span className="text-[10px] font-black text-slate-300">%</span>}
       </div>
       <button type="button" onClick={() => onChange(isPercentage ? Math.min(100, value + 1) : value + 1)} className="w-12 h-full flex items-center justify-center text-slate-300 hover:text-blue-600 transition-colors">
         <Plus size={16} />
       </button>
    </div>
  </div>
);

const ToggleGroup: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
  <button 
    type="button" onClick={() => onChange(!value)}
    className={`w-full p-5 rounded-2xl border flex items-center justify-between transition-all ${value ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
  >
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    <div className={`w-8 h-4 rounded-full relative ${value ? 'bg-white/20' : 'bg-slate-200'}`}>
       <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${value ? 'right-0.5 bg-white' : 'left-0.5 bg-slate-400'}`} />
    </div>
  </button>
);

const StatusBadge: React.FC<{ status: ProposalStatus }> = ({ status }) => {
  const isApproved = status === ProposalStatus.APPROVED;
  return (
    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${isApproved ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
      {status}
    </span>
  );
};

export default SchoolSelection;
