
import React, { useState, useMemo } from 'react';
import { User, District, ServiceRequest, ServiceRequestCategory, ProposalStatus, SchoolProposal, Role } from '../types';
import { jsPDF } from 'jspdf';
import { 
  Plus, 
  X, 
  Send, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Building2,
  Users2,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Loader2,
  ArrowRight,
  Minus,
  FileText,
  User as UserIcon,
  CalendarDays,
  Activity,
  Hash,
  BadgeCheck,
  Info,
  CheckSquare,
  Ticket,
  Terminal,
  Calculator,
  Navigation,
  MapPin,
  Map,
  ShieldAlert,
  Download,
  Filter,
  AlertCircle,
  ShieldCheck,
  // Fix: Added missing History import from lucide-react and aliased it to HistoryIcon
  // to prevent collision with the global 'History' interface/constructor.
  History as HistoryIcon
} from 'lucide-react';

interface ServiceRequestsProps {
  user: User;
  districts: District[];
  serviceRequests: ServiceRequest[];
  onAddRequest: (request: ServiceRequest) => void;
  onUpdateRequests: (requests: ServiceRequest[]) => void;
}

const SCHOOL_CATEGORIES = ['Government', 'Aided', 'Unaided', 'Private'];
const SCHOOL_STATUSES = ['Operational', 'New Enrollment', 'Relocated'];
const AMENITY_OPTIONS = ['Drinking Water', 'Hygiene Washroom', 'Sanitation', 'Electricity', 'Infrastructure'];

const INITIAL_SCHOOL_DATA = {
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
  class6Boys: 0, class6Girls: 0,
  class7Boys: 0, class7Girls: 0,
  class8Boys: 0, class8Girls: 0,
  class9Boys: 0, class9Girls: 0,
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
  selectionComments: '',
  groupsDivided: 1,
  strengthPerGroup: 0
};

const ServiceRequests: React.FC<ServiceRequestsProps> = ({ user, districts, serviceRequests, onAddRequest, onUpdateRequests }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceRequestCategory>(ServiceRequestCategory.SCHOOL_SELECTION);
  const [description, setDescription] = useState('');
  const [schoolData, setSchoolData] = useState(INITIAL_SCHOOL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});

  const isAdmin = user.role === Role.BREADS_COORDINATOR || user.role === Role.SUPER_ADMIN;

  const myRequests = useMemo(() => {
    const list = isAdmin 
      ? serviceRequests 
      : serviceRequests.filter(r => r.districtId === user.districtId);
    return [...list].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  }, [serviceRequests, user.districtId, isAdmin]);

  const nextRequestNum = useMemo(() => {
    return (serviceRequests.length + 1).toString().padStart(3, '0');
  }, [serviceRequests]);

  const totals = useMemo(() => {
    const b = schoolData.class6Boys + schoolData.class7Boys + schoolData.class8Boys + schoolData.class9Boys;
    const g = schoolData.class6Girls + schoolData.class7Girls + schoolData.class8Girls + schoolData.class9Girls;
    const t = b + g;
    const teachers = schoolData.teachersMale + schoolData.teachersFemale;
    const strength = schoolData.groupsDivided > 0 ? Math.ceil(t / schoolData.groupsDivided) : 0;
    return { boys: b, girls: g, total: t, teachers, strength };
  }, [schoolData]);

  const generatePDF = (request: ServiceRequest) => {
    const doc = new jsPDF();
    const data = request.schoolSelectionData;
    if (!data) return;

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("BREADS MINDS - TECHNICAL DOSSIER", 20, 20);
    doc.setFontSize(10);
    doc.text(`SERVICE REQUEST: ${request.requestNumber} | DATE: ${new Date(request.requestedAt).toLocaleDateString()}`, 20, 30);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.text("1. SCHOOL PROFILE", 20, 55);
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 58, 190, 58);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const profile = [
      ["School Name:", data.schoolName],
      ["Location:", `${data.villageName}, ${data.taluka}`],
      ["District:", districts.find(d => d.id === request.districtId)?.name || "N/A"],
      ["Category:", `${data.schoolCategory} (${data.schoolStatus})`],
      ["Distance from DB:", `${data.distanceFromCenter} KM`],
      ["Address:", data.completeAddress]
    ];

    let y = 68;
    profile.forEach(([label, val]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label as string, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(val as string, 65, y);
      y += 8;
    });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("2. POPULATION DYNAMICS", 20, y + 10);
    doc.line(20, y + 13, 190, y + 13);
    y += 23;

    const stats = [
      ["Total Enrollment:", data.totalEnrollment.toString()],
      ["Total Staff:", (data.teachersMale + data.teachersFemale).toString()],
      ["Male Teachers:", data.teachersMale.toString()],
      ["Female Teachers:", data.teachersFemale.toString()],
      ["Target Groups:", data.groupsDivided.toString()],
      ["Group Strength:", data.strengthPerGroup.toString()]
    ];

    stats.forEach(([label, val]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label as string, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(val as string, 65, y);
      y += 8;
    });

    y += 5;
    doc.setFillColor(248, 250, 252);
    doc.rect(20, y, 170, 35, 'F');
    doc.setFontSize(9);
    doc.text("Class", 30, y + 8);
    doc.text("Boys", 70, y + 8);
    doc.text("Girls", 110, y + 8);
    doc.text("Total", 150, y + 8);
    doc.line(20, y + 10, 190, y + 10);

    const classes = [
      ["Class 6", data.class6Boys, data.class6Girls],
      ["Class 7", data.class7Boys, data.class7Girls],
      ["Class 8", data.class8Boys, data.class8Girls],
      ["Class 9", data.class9Boys, data.class9Girls]
    ];

    classes.forEach(([label, b, g], i) => {
      const rowY = y + 18 + (i * 6);
      doc.text(label as string, 30, rowY);
      doc.text(b.toString(), 70, rowY);
      doc.text(g.toString(), 110, rowY);
      doc.text(((b as number) + (g as number)).toString(), 150, rowY);
    });

    // Fix: Using doc.getNumberOfPages() instead of invalid property doc.previousPageNumber 
    // and correctly accessing page count before/after addPage() to determine coordinate reset.
    const initialPageCount = doc.getNumberOfPages();
    if (y + 60 > 280) {
      doc.addPage();
    }
    const finalPageCount = doc.getNumberOfPages();
    y = finalPageCount !== initialPageCount ? 20 : y + 50;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("3. SELECTION RATIONALE", 20, y);
    doc.line(20, y + 3, 190, y + 3);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const splitJustification = doc.splitTextToSize(data.justification, 170);
    doc.text(splitJustification, 20, y + 12);

    doc.save(`MINDS_Dossier_${data.schoolName.replace(/\s+/g, '_')}.pdf`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: { [key: string]: boolean } = {};
    if (selectedCategory === ServiceRequestCategory.SCHOOL_SELECTION) {
      if (!schoolData.schoolName.trim()) errors.schoolName = true;
      if (schoolData.totalEnrollment <= 0) errors.totalEnrollment = true;
      if (schoolData.hasSchoolCounselor && !schoolData.schoolCounselorName.trim()) errors.schoolCounselorName = true;
      if (!schoolData.justification.trim()) errors.justification = true;
    } else {
      if (!description.trim()) errors.description = true;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const timestamp = Date.now();
      const newRequest: ServiceRequest = {
        id: `sr-${timestamp}`,
        requestNumber: `SR-${nextRequestNum}`,
        districtId: user.districtId || 'HQ',
        category: selectedCategory,
        requestedBy: user.id,
        requestedByName: user.name,
        requestedAt: new Date().toISOString(),
        status: ProposalStatus.PENDING,
        description: description,
        schoolSelectionData: selectedCategory === ServiceRequestCategory.SCHOOL_SELECTION ? {
          ...schoolData,
          id: `sp-${timestamp}`,
          districtId: user.districtId || 'HQ',
          proposedBy: user.id,
          proposedByName: user.name,
          proposedAt: new Date().toISOString(),
          status: ProposalStatus.PENDING,
          teachersTotal: totals.teachers,
          grandTotalBoys: totals.boys,
          grandTotalGirls: totals.girls,
          grandTotalTotal: totals.total,
          strengthPerGroup: totals.strength,
          estimatedBeneficiaries: totals.total,
          class5Boys: 0,
          class5Girls: 0
        } : undefined
      };

      onAddRequest(newRequest);
      
      if (selectedCategory === ServiceRequestCategory.SCHOOL_SELECTION) {
        generatePDF(newRequest);
      }

      setIsAdding(false);
      setIsSubmitting(false);
      setSchoolData(INITIAL_SCHOOL_DATA);
      setDescription('');
      setFieldErrors({});
    }, 1200);
  };

  const updateSchoolField = (name: string, value: any) => {
    setSchoolData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[40px] border shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Service Requests</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">School records for {isAdmin ? 'Global Hierarchy' : 'District Node Contributions'}</p>
        </div>
        {!isAdmin && (
          <button onClick={() => setIsAdding(true)} className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center gap-3 hover:bg-blue-700 transition-all active:scale-95">
            <Plus size={16} /> New Proposal
          </button>
        )}
      </div>

      <div className="space-y-4">
        {myRequests.map(request => (
          <div key={request.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 space-y-8 group hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-6">
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all ${request.status === ProposalStatus.APPROVED ? 'bg-emerald-50 text-emerald-600' : request.status === ProposalStatus.REJECTED ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                  {request.status === ProposalStatus.APPROVED ? <CheckCircle2 size={32} /> : request.status === ProposalStatus.REJECTED ? <XCircle size={32} /> : <Clock size={32} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest bg-blue-50 px-2.5 py-1 rounded-lg">#{request.requestNumber}</span>
                    <h4 className="font-black text-slate-900 text-xl tracking-tight">{request.schoolSelectionData?.schoolName || request.category}</h4>
                  </div>
                  <div className="flex items-center gap-3">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={12}/> {districts.find(d => d.id === request.districtId)?.name || 'HQ Unit'}</p>
                     <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{request.category}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <StatusBadge status={request.status} />
                {request.schoolSelectionData && (
                  <button 
                    onClick={() => generatePDF(request)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                  >
                    <Download size={14} /> Technical Dossier
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <DataField icon={<CalendarDays size={16} className="text-slate-400"/>} label="Submission Date" value={new Date(request.requestedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })} />
              <DataField icon={<UserIcon size={16} className="text-slate-400"/>} label="Proposed By" value={request.requestedByName} />
              
              {request.schoolSelectionData ? (
                <>
                  <DataField icon={<Users2 size={16} className="text-slate-400"/>} label="Total Enrollment" value={request.schoolSelectionData.totalEnrollment} />
                  <DataField icon={<Activity size={16} className="text-slate-400"/>} label="Suitability" value={request.schoolSelectionData.overallSuitability} color={request.schoolSelectionData.overallSuitability === 'High' ? 'text-emerald-600' : 'text-amber-500'} />
                </>
              ) : (
                <DataField icon={<Info size={16} className="text-slate-400"/>} label="Ref Number" value={request.requestNumber} />
              )}
            </div>

            <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 relative overflow-hidden group-hover:bg-slate-100/50 transition-colors">
               <div className="flex items-center gap-2 mb-3">
                 <FileText size={14} className="text-blue-500" />
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Field Rationale</span>
               </div>
               <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic">
                 "{request.category === ServiceRequestCategory.SCHOOL_SELECTION ? request.schoolSelectionData?.justification : request.description}"
               </p>
               {request.remarks && (
                 <div className="mt-4 p-4 bg-white border border-slate-100 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                       <ShieldCheck size={12} className="text-blue-600"/>
                       <span className="text-[9px] font-black uppercase text-blue-600">HQ Auditor Remarks</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 italic">{request.remarks}</p>
                 </div>
               )}
            </div>
          </div>
        ))}

        {myRequests.length === 0 && (
          <div className="py-32 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
               {/* Fix: Use HistoryIcon which is correctly aliased to lucide icon to avoid naming conflicts */}
               <HistoryIcon size={40} className="text-slate-200" />
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">No Submissions Found</h3>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">Team contributions for your district node will appear here</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-[44px] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[95vh]">
            <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Raise New Request</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1.5"><Terminal size={12}/> Technical Review Lifecycle Initiation</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-10 overflow-y-auto no-scrollbar">
              
              <div className="relative overflow-hidden bg-slate-950 rounded-[32px] p-8 text-white shadow-2xl border border-slate-800">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Ticket size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-600/20 rounded-xl">
                        <BadgeCheck size={18} className="text-blue-400" />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Formal Metadata Receipt</h4>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8">
                    <MetadataItem icon={<Hash size={14}/>} label="Request Number" value={`SR-${nextRequestNum}`} highlight />
                    <MetadataItem icon={<Building2 size={14}/>} label="Requested For" value={selectedCategory === ServiceRequestCategory.SCHOOL_SELECTION ? (schoolData.schoolName || 'Not Defined') : selectedCategory} color="text-blue-400" />
                    <MetadataItem icon={<CalendarDays size={14}/>} label="Opened Date" value={new Date().toLocaleDateString('en-IN')} />
                    <MetadataItem icon={<UserIcon size={14}/>} label="Opened By" value={user.name} />
                    <MetadataItem icon={<CheckSquare size={14}/>} label="Approval Level" value="Requested" color="text-amber-400" />
                    <MetadataItem icon={<Activity size={14}/>} label="Request State" value="Pending Approval" color="text-amber-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Submission Category <span className="text-rose-500">*</span></label>
                  <select 
                    value={selectedCategory} 
                    onChange={e => setSelectedCategory(e.target.value as ServiceRequestCategory)} 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm outline-none cursor-pointer focus:ring-4 focus:ring-blue-500/10 transition-all"
                  >
                    {Object.values(ServiceRequestCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                {selectedCategory === ServiceRequestCategory.SCHOOL_SELECTION ? (
                  <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                    <FormSection title="1. Identity & Location" icon={<Navigation size={16}/>}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput label="School Name *" value={schoolData.schoolName} onChange={v => updateSchoolField('schoolName', v)} error={fieldErrors.schoolName} required />
                        <FormInput label="Taluka" value={schoolData.taluka} onChange={v => updateSchoolField('taluka', v)} />
                        <FormInput label="Gram Panchayat" value={schoolData.gramPanchayat} onChange={v => updateSchoolField('gramPanchayat', v)} />
                        <FormInput label="Village Name" value={schoolData.villageName} onChange={v => updateSchoolField('villageName', v)} />
                        <FormNumeric label="Distance from DB Center (KM)" value={schoolData.distanceFromCenter} onChange={v => updateSchoolField('distanceFromCenter', v)} />
                        <FormSelect label="Category of School" options={SCHOOL_CATEGORIES} value={schoolData.schoolCategory} onChange={v => updateSchoolField('schoolCategory', v)} />
                        <FormSelect label="Status" options={SCHOOL_STATUSES} value={schoolData.schoolStatus} onChange={v => updateSchoolField('schoolStatus', v)} />
                        <div className="md:col-span-2">
                           <FormInput label="Complete Address of School" value={schoolData.completeAddress} onChange={v => updateSchoolField('completeAddress', v)} />
                        </div>
                      </div>
                    </FormSection>

                    <FormSection title="2. Technical Metrics Checklist" icon={<ClipboardCheck size={16}/>}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <FormNumeric label="Total Enrollment in School *" value={schoolData.totalEnrollment} onChange={v => updateSchoolField('totalEnrollment', v)} error={fieldErrors.totalEnrollment} required />
                        <FormNumeric label="Students Requiring Additional Support" value={schoolData.studentsRequiringSupport} onChange={v => updateSchoolField('studentsRequiringSupport', v)} />
                        <FormNumeric label="Enrolment from Marginalized Background" value={schoolData.marginalizedPercentage} onChange={v => updateSchoolField('marginalizedPercentage', v)} isPercentage />
                        <FormNumeric label="Overall % of SDQ Students" value={schoolData.sdqPercentage} onChange={v => updateSchoolField('sdqPercentage', v)} isPercentage />
                        <FormNumeric label="Academic Performance" value={schoolData.academicPerformancePercentage} onChange={v => updateSchoolField('academicPerformancePercentage', v)} isPercentage />
                        <FormNumeric label="Dropout Rate" value={schoolData.dropoutRatePercentage} onChange={v => updateSchoolField('dropoutRatePercentage', v)} isPercentage />
                        <FormNumeric label="Teachers Willing to Be Trained" value={schoolData.teachersWillingPercentage} onChange={v => updateSchoolField('teachersWillingPercentage', v)} isPercentage />
                      </div>
                    </FormSection>

                    <FormSection title="3. School Readiness" icon={<Users2 size={16}/>}>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormToggle label="Presence of School Counselor" value={schoolData.hasSchoolCounselor} onChange={v => updateSchoolField('hasSchoolCounselor', v)} />
                          {schoolData.hasSchoolCounselor && (
                            <FormInput label="Counselor Name *" value={schoolData.schoolCounselorName} onChange={v => updateSchoolField('schoolCounselorName', v)} error={fieldErrors.schoolCounselorName} required />
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormToggle label="Substitution of MH Support Staff" value={schoolData.hasSupportStaffSubstitution} onChange={v => updateSchoolField('hasSupportStaffSubstitution', v)} />
                          <FormToggle label="Partnership with MH Professionals" value={schoolData.hasProfessionalPartnership} onChange={v => updateSchoolField('hasProfessionalPartnership', v)} />
                          <FormToggle label="Proactive School Administration" value={schoolData.proactiveAdministration} onChange={v => updateSchoolField('proactiveAdministration', v)} />
                          <FormToggle label="Physical space for MH Programs" value={schoolData.hasPhysicalSpace} onChange={v => updateSchoolField('hasPhysicalSpace', v)} />
                          <FormToggle label="High-Risk Socio-Economic Region" value={schoolData.isHighRiskRegion} onChange={v => updateSchoolField('isHighRiskRegion', v)} />
                          <FormToggle label="Active SDMC" value={schoolData.hasActiveSDMC} onChange={v => updateSchoolField('hasActiveSDMC', v)} />
                          <FormToggle label="Teacher and HM Interest" value={schoolData.hasStaffInterest} onChange={v => updateSchoolField('hasStaffInterest', v)} />
                        </div>
                        <div className="space-y-4">
                          <FormToggle label="Availability of Basic Amenities" value={schoolData.hasBasicAmenities} onChange={v => updateSchoolField('hasBasicAmenities', v)} />
                          {schoolData.hasBasicAmenities && (
                            <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
                              {AMENITY_OPTIONS.map(opt => (
                                <button 
                                  key={opt}
                                  type="button"
                                  onClick={() => {
                                    const next = schoolData.amenitiesList.includes(opt) 
                                      ? schoolData.amenitiesList.filter(i => i !== opt) 
                                      : [...schoolData.amenitiesList, opt];
                                    updateSchoolField('amenitiesList', next);
                                  }}
                                  className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${schoolData.amenitiesList.includes(opt) ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </FormSection>

                    <FormSection title="4. Detailed Demographics" icon={<Calculator size={16}/>}>
                       <div className="space-y-8">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <FormNumeric label="Staff: Male" value={schoolData.teachersMale} onChange={v => updateSchoolField('teachersMale', v)} />
                            <FormNumeric label="Staff: Female" value={schoolData.teachersFemale} onChange={v => updateSchoolField('teachersFemale', v)} />
                            <div className="p-4 bg-slate-900 rounded-2xl flex flex-col justify-center">
                               <span className="text-[9px] font-black uppercase text-slate-400">Total Staff</span>
                               <span className="text-xl font-black text-white">{totals.teachers}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <ClassRow label="Class 6" b={schoolData.class6Boys} g={schoolData.class6Girls} onB={v => updateSchoolField('class6Boys', v)} onG={v => updateSchoolField('class6Girls', v)} />
                             <ClassRow label="Class 7" b={schoolData.class7Boys} g={schoolData.class7Girls} onB={v => updateSchoolField('class7Boys', v)} onG={v => updateSchoolField('class7Girls', v)} />
                             <ClassRow label="Class 8" b={schoolData.class8Boys} g={schoolData.class8Girls} onB={v => updateSchoolField('class8Boys', v)} onG={v => updateSchoolField('class8Girls', v)} />
                             <ClassRow label="Class 9" b={schoolData.class9Boys} g={schoolData.class9Girls} onB={v => updateSchoolField('class9Boys', v)} onG={v => updateSchoolField('class9Girls', v)} />
                          </div>

                          <div className="bg-blue-600 rounded-[32px] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                             <div className="flex items-center gap-4">
                               <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center"><Users2 size={28}/></div>
                               <div>
                                  <h5 className="text-[10px] font-black uppercase tracking-widest opacity-60">Grand Total Beneficiaries</h5>
                                  <p className="text-3xl font-black">{totals.total}</p>
                               </div>
                             </div>
                             <div className="flex gap-8">
                                <div className="text-right">
                                   <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Boys</span>
                                   <p className="text-xl font-black">{totals.boys}</p>
                                </div>
                                <div className="text-right">
                                   <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Girls</span>
                                   <p className="text-xl font-black">{totals.girls}</p>
                                </div>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormNumeric label="Total No of Groups Divided" value={schoolData.groupsDivided} onChange={v => updateSchoolField('groupsDivided', v)} />
                            <div className="p-5 bg-slate-50 border border-slate-100 rounded-[32px] md:col-span-2 flex items-center justify-between">
                               <div>
                                  <span className="text-[10px] font-black uppercase text-slate-400">Strength in each group</span>
                                  <p className="text-lg font-black text-slate-800 tracking-tight">~ {totals.strength} Students</p>
                               </div>
                               <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100"><Calculator size={20} className="text-blue-600"/></div>
                            </div>
                          </div>
                       </div>
                    </FormSection>

                    <FormSection title="5. Final Assessment & Rationale" icon={<ArrowRight size={16}/>}>
                      <div className="space-y-6">
                        <FormSelect label="Overall Suitability for Mental Health Program" options={['High', 'Medium', 'Low']} value={schoolData.overallSuitability} onChange={v => updateSchoolField('overallSuitability', v as any)} />
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Reasons for selecting the school *</label>
                           <textarea 
                             value={schoolData.justification} 
                             onChange={e => updateSchoolField('justification', e.target.value)} 
                             className={`w-full h-32 px-5 py-4 bg-slate-50 border ${fieldErrors.justification ? 'border-rose-400' : 'border-slate-100'} rounded-2xl outline-none font-medium text-xs resize-none transition-all`} 
                             placeholder="Provide high-level technical justification..." 
                             required
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Comments/Notes</label>
                           <textarea 
                             value={schoolData.selectionComments} 
                             onChange={e => updateSchoolField('selectionComments', e.target.value)} 
                             className="w-full h-24 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-xs resize-none" 
                             placeholder="Internal reviewer notes..." 
                           />
                        </div>
                      </div>
                    </FormSection>
                  </div>
                ) : (
                  <div className="space-y-3 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Detailed Technical Specifications <span className="text-rose-500">*</span></label>
                    <textarea 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      className={`w-full h-48 px-6 py-5 bg-slate-50 border ${fieldErrors.description ? 'border-rose-400' : 'border-slate-200'} rounded-[32px] outline-none font-medium text-sm leading-relaxed resize-none focus:ring-4 focus:ring-blue-500/10 transition-all`} 
                      placeholder="Provide full description of the request..." 
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 pt-4 border-t border-slate-50">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-blue-600 text-white rounded-[32px] font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={18} />}
                  Commit Formal Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const MetadataItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color?: string; highlight?: boolean }> = ({ icon, label, value, color, highlight }) => (
  <div className="flex flex-col items-start space-y-2">
    <div className="flex items-center gap-2 opacity-50">
      <div className="p-1 bg-white/5 rounded-lg">{icon}</div>
      <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
    </div>
    <span className={`text-sm font-black truncate max-w-full leading-tight ${highlight ? 'text-blue-400' : (color || 'text-white')}`}>
      {value}
    </span>
  </div>
);

const DataField: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color?: string }> = ({ icon, label, value, color }) => (
  <div className="space-y-1 p-3 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-white transition-all">
    <div className="flex items-center gap-1.5 opacity-50">
      {icon}
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className={`text-xs font-black ${color || 'text-slate-800'} tracking-tight`}>{value}</p>
  </div>
);

const FormSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`border rounded-[32px] transition-all overflow-hidden ${isOpen ? 'bg-white shadow-xl border-slate-200' : 'bg-slate-50/50 border-slate-100'}`}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full px-8 py-5 flex items-center justify-between text-left hover:bg-white transition-all">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isOpen ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>{icon}</div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
      </button>
      {isOpen && <div className="p-8 border-t border-slate-50 bg-white animate-in slide-in-from-top-2 duration-300">{children}</div>}
    </div>
  );
};

const FormInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; error?: boolean; required?: boolean }> = ({ label, value, onChange, error, required }) => (
  <div className="space-y-2">
    <label className={`text-[9px] font-black uppercase ${error ? 'text-rose-500' : 'text-slate-400'} tracking-widest ml-1`}>
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} className={`w-full px-5 py-4 bg-slate-50 border ${error ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-200'} rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all`} placeholder={`Enter ${label}...`} />
  </div>
);

const FormSelect: React.FC<{ label: string; options: string[]; value: string; onChange: (v: string) => void }> = ({ label, options, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none cursor-pointer focus:ring-4 focus:ring-blue-500/10 transition-all">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const FormNumeric: React.FC<{ label: string; value: number; onChange: (v: number) => void; error?: boolean; required?: boolean; isPercentage?: boolean }> = ({ label, value, onChange, error, required, isPercentage }) => (
  <div className="space-y-2">
    <label className={`text-[9px] font-black uppercase ${error ? 'text-rose-500' : 'text-slate-400'} tracking-widest ml-1`}>
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className={`flex items-center bg-white border ${error ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-200'} rounded-2xl p-1.5 h-[56px] shadow-sm`}>
       <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="w-10 h-full flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors"><Minus size={16}/></button>
       <input 
        type="number" 
        value={value} 
        onChange={e => {
          let v = parseInt(e.target.value) || 0;
          if (isPercentage) v = Math.min(100, Math.max(0, v));
          onChange(v);
        }} 
        className="flex-1 bg-transparent text-center font-black text-sm outline-none no-spinner" 
       />
       {isPercentage && <span className="text-xs font-black text-slate-300 pr-3">%</span>}
       <button type="button" onClick={() => onChange(isPercentage ? Math.min(100, value + 1) : value + 1)} className="w-10 h-full flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors"><Plus size={16}/></button>
    </div>
  </div>
);

const FormToggle: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:bg-white transition-all group">
    <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-slate-700">{label}</span>
    <button type="button" onClick={() => onChange(!value)} className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${value ? 'bg-blue-600' : 'bg-slate-300'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${value ? 'right-1' : 'left-1'}`} />
    </button>
  </div>
);

const ClassRow: React.FC<{ label: string; b: number; g: number; onB: (v: number) => void; onG: (v: number) => void }> = ({ label, b, g, onB, onG }) => (
  <div className="p-5 bg-slate-50 border border-slate-100 rounded-[28px] space-y-3">
    <div className="flex items-center justify-between px-1">
      <span className="text-[10px] font-black uppercase text-slate-900">{label}</span>
      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">Sum: {b+g}</span>
    </div>
    <div className="grid grid-cols-2 gap-3">
       <FormNumeric label="Boys" value={b} onChange={onB} />
       <FormNumeric label="Girls" value={g} onChange={onG} />
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: ProposalStatus }> = ({ status }) => {
  const styles = status === ProposalStatus.APPROVED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                status === ProposalStatus.REJECTED ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                'bg-amber-50 text-amber-600 border-amber-100';
  return <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${styles}`}>{status}</span>;
};

export default ServiceRequests;
