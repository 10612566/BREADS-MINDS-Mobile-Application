
export enum Role {
  DISTRICT_COORDINATOR = 'DISTRICT_COORDINATOR',
  BREADS_COORDINATOR = 'BREADS_COORDINATOR',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE'
}

export enum ProposalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum ServiceRequestCategory {
  SCHOOL_SELECTION = 'School Selection',
  INFRASTRUCTURE_SUPPORT = 'Infrastructure Support',
  PERSONNEL_REQUEST = 'Personnel Request',
  BUDGET_APPROVAL = 'Budget Approval'
}

export interface Area {
  id: string;
  name: string;
}

export interface District {
  id: string;
  name: string;
  areaId: string;
}

export interface School {
  id: string;
  name: string;
  districtId: string;
  isActive?: boolean;
  taluka?: string;
  gramPanchayat?: string;
  village?: string;
  distanceFromCenter?: number;
  schoolCategory?: string;
  schoolStatus?: string;
  completeAddress?: string;
  justification?: string;
  
  // Master Database expanded fields
  teachersMale?: number;
  teachersFemale?: number;
  teachersTotal?: number;
  class6Boys?: number;
  class6Girls?: number;
  class7Boys?: number;
  class7Girls?: number;
  class8Boys?: number;
  class8Girls?: number;
  class9Boys?: number;
  class9Girls?: number;
  grandTotalTotal?: number;
  groupsDivided?: number;
  strengthPerGroup?: number;
  
  totalEnrollment?: number;
  marginalizedPercentage?: number;
  sdqPercentage?: number;
  academicPerformancePercentage?: number;
  dropoutRatePercentage?: number;
  studentsRequiringSupport?: number;
  hasSchoolCounselor?: boolean;
  schoolCounselorName?: string;
  hasBasicAmenities?: boolean;
  amenitiesList?: string[];
  overallSuitability?: 'High' | 'Medium' | 'Low';
}

export interface SystemLog {
  id: string;
  timestamp: string;
  performedBy: string;
  action: string;
  details: string;
}

export interface MindsActivityRecord {
  id: string;
  districtId: string;
  year: number;
  childName: string;
  age: number;
  className: string;
  schoolName: string;
  interventionType: string;
  gender: 'Male' | 'Female' | 'Other';
  location: string;
  topicsDiscussed: string;
  session1Date: string;
  session2Date: string;
  session3Date: string;
  outcome: string;
  followUp: string;
  remarks: string;
  submittedBy: string;
  submittedAt: string;
}

export interface SchoolProposal {
  id: string;
  districtId: string;
  proposedBy: string;
  proposedByName: string;
  proposedAt: string;
  status: ProposalStatus;
  remarks?: string;

  taluka: string;
  gramPanchayat: string;
  villageName: string;
  distanceFromCenter: number;
  schoolName: string;
  schoolCategory: string; 
  schoolStatus: string;
  completeAddress: string;
  justification: string;
  
  teachersMale: number;
  teachersFemale: number;
  teachersTotal: number;

  class5Boys: number;
  class5Girls: number;
  class6Boys: number;
  class6Girls: number;
  class7Boys: number;
  class7Girls: number;
  class8Boys: number;
  class8Girls: number;
  class9Boys: number;
  class9Girls: number;

  grandTotalBoys: number;
  grandTotalGirls: number;
  grandTotalTotal: number;

  groupsDivided: number;
  strengthPerGroup: number;

  totalEnrollment: number;
  marginalizedPercentage: number;
  sdqPercentage: number;
  academicPerformancePercentage: number;
  dropoutRatePercentage: number;
  studentsRequiringSupport: number;
  hasSchoolCounselor: boolean;
  schoolCounselorName?: string;
  hasSupportStaffSubstitution: boolean;
  hasProfessionalPartnership: boolean;
  teachersWillingPercentage: number;
  proactiveAdministration: boolean;
  hasPhysicalSpace: boolean;
  hasBasicAmenities: boolean;
  amenitiesList: string[];
  isHighRiskRegion: boolean;
  hasActiveSDMC: boolean;
  hasStaffInterest: boolean;
  overallSuitability: 'High' | 'Medium' | 'Low';
  selectionComments: string;
  estimatedBeneficiaries: number;
}

export interface ServiceRequest {
  id: string;
  requestNumber: string;
  districtId: string;
  category: ServiceRequestCategory;
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  status: ProposalStatus;
  remarks?: string;
  schoolSelectionData?: SchoolProposal;
  description?: string;
}

export interface SchoolMonthlyReport {
  id: string;
  districtId: string;
  schoolId: string;
  schoolName: string;
  visitDate: string;
  typeOfVisit: 'Routine' | 'Evaluation' | 'Crisis Support' | 'Follow-up';
  mindsGroupsEstablished: number;
  childrenInMindsGroups: number;
  moduleNumber: number;
  childrenAttended: number;
  actionPrompts: string;
  referredForCounselling: number;
  identifiedWithIssues: number;
  challenges: string;
  followUpPlan: string;
  followUpDate: string;
  notesForNextModule: string;
  submittedBy: string;
  submittedAt: string;
}

export interface MonthlyPlanItem {
  id: string;
  districtId: string;
  month: string; // YYYY-MM
  description: string;
  date: string;
  responsiblePersons: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  submittedBy: string;
  submittedAt: string;
}

export interface HealthProgram {
  id: string;
  name: string;
  isActive: boolean;
  dedicatedFor: string;
  objective: string;
}

export enum TargetGroup {
  CHILDREN = 'Children',
  PARENTS = 'Parents',
  PROFESSIONALS = 'Mental Health Professionals',
  TEACHERS = 'School Teachers',
  VOLUNTEERS = 'Community Leaders/Volunteers'
}

export enum NoticePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Notice {
  id: string;
  title: string;
  message: string;
  priority: NoticePriority;
  targetRoles: Role[];
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export interface BeneficiaryReport {
  id: string;
  districtId: string;
  month: string; // YYYY-MM
  year: number;
  submittedAt: string;
  submittedBy: string;
  targetsReached: {
    [key in TargetGroup]: number;
  };
  activities: {
    educationModules: number;
    campaigns: number;
    therapyWorkshops: number;
    counsellingSessions: number;
    parentalTraining: number;
  };
  narrativeImpact: string;
  isLocked: boolean;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
  role: Role;
  status: UserStatus;
  districtId?: string;
  photo?: string;
}

export interface AppState {
  currentUser: User | null;
  reports: BeneficiaryReport[];
  monthlyDeadline: number;
  areas: Area[];
  districts: District[];
  healthPrograms: HealthProgram[];
  schoolProposals: SchoolProposal[];
  serviceRequests: ServiceRequest[];
}
