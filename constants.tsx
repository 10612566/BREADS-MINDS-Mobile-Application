
import React from 'react';
import { TargetGroup, Role, BeneficiaryReport, User, UserStatus, Area, District, Notice, NoticePriority, School, HealthProgram, ServiceRequest, ServiceRequestCategory, ProposalStatus } from './types';
import { 
  FileText, 
  BarChart3, 
  ShieldCheck, 
  LayoutDashboard,
  School as SchoolIcon,
  MessageSquarePlus
} from 'lucide-react';

export const TARGET_GROUPS = Object.values(TargetGroup);

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: [Role.BREADS_COORDINATOR, Role.DISTRICT_COORDINATOR, Role.SUPER_ADMIN] },
  { id: 'service-requests', label: 'Service Requests', icon: <MessageSquarePlus size={20} />, roles: [Role.DISTRICT_COORDINATOR, Role.BREADS_COORDINATOR, Role.SUPER_ADMIN] },
  { id: 'data-entry', label: 'Monthly Entry', icon: <FileText size={20} />, roles: [Role.DISTRICT_COORDINATOR] },
  { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} />, roles: [Role.BREADS_COORDINATOR, Role.DISTRICT_COORDINATOR, Role.SUPER_ADMIN] },
  { id: 'admin', label: 'Admin Panel', icon: <ShieldCheck size={20} />, roles: [Role.BREADS_COORDINATOR, Role.SUPER_ADMIN] },
];

export const TARGET_ANNUAL = {
  [TargetGroup.CHILDREN]: 18000,
  [TargetGroup.PARENTS]: 18000,
  [TargetGroup.PROFESSIONALS]: 60,
  [TargetGroup.TEACHERS]: 300,
  [TargetGroup.VOLUNTEERS]: 60,
};

// Initial Hierarchy
export const INITIAL_AREAS: Area[] = [
  { id: 'a1', name: 'South Karnataka' },
  { id: 'a2', name: 'North Karnataka' }
];

export const INITIAL_DISTRICTS: District[] = [
  { id: 'd1', name: 'Bangalore', areaId: 'a1' },
  { id: 'd2', name: 'Chitradurga', areaId: 'a1' },
  { id: 'd3', name: 'Bidar', areaId: 'a2' },
  { id: 'd4', name: 'Yadgir', areaId: 'a2' }
];

export const INITIAL_SCHOOLS: School[] = [
  { id: 's1', name: 'St. Joseph High School', districtId: 'd1', isActive: true },
  { id: 's2', name: 'Government Primary School - Ulsoor', districtId: 'd1', isActive: true },
  { id: 's3', name: 'Vidhya Vardhaka School', districtId: 'd3', isActive: true }
];

export const INITIAL_HEALTH_PROGRAMS: HealthProgram[] = [
  { id: 'hp1', name: 'Emotional Resilience Workshop', isActive: true, dedicatedFor: 'Children', objective: 'Build coping mechanisms for academic stress.' },
  { id: 'hp2', name: 'Positive Parenting Seminar', isActive: true, dedicatedFor: 'Parents', objective: 'Enhance family communication and child mental support.' }
];

// Registered Users for the System
export const MOCK_USERS: (User & { username: string; password: string })[] = [
  {
    id: 'u0',
    username: 'superadmin',
    password: 'breads_master',
    name: 'BREADS Director',
    email: 'director@breads.org',
    role: Role.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
  },
  {
    id: 'u1',
    username: 'admin',
    password: 'breads_hq',
    name: 'Bangalore HQ Admin',
    email: 'admin@breads.org',
    mobile: '+91 98765 43210',
    role: Role.BREADS_COORDINATOR,
    status: UserStatus.ACTIVE,
  },
  {
    id: 'u2',
    username: 'dc_bangalore',
    password: 'minds_blr',
    name: 'Bangalore Coordinator',
    email: 'blr.coord@breads.org',
    mobile: '+91 98888 77777',
    role: Role.DISTRICT_COORDINATOR,
    districtId: 'd1',
    status: UserStatus.ACTIVE,
  },
  {
    id: 'u3',
    username: 'dc_bidar',
    password: 'minds_bdr',
    name: 'Bidar Coordinator',
    email: 'bidar.coord@breads.org',
    mobile: '+91 91111 22222',
    role: Role.DISTRICT_COORDINATOR,
    districtId: 'd3',
    status: UserStatus.ACTIVE,
  }
];

export const MOCK_SERVICE_REQUESTS: ServiceRequest[] = [
  {
    id: 'sr-mock-1',
    requestNumber: 'SR-001',
    districtId: 'd1',
    category: ServiceRequestCategory.SCHOOL_SELECTION,
    requestedBy: 'u2', // dc_bangalore
    requestedByName: 'Bangalore Coordinator',
    requestedAt: '2024-11-15T09:00:00Z',
    status: ProposalStatus.PENDING,
    schoolSelectionData: {
      id: 'sp-mock-1',
      districtId: 'd1',
      proposedBy: 'u2',
      proposedByName: 'Bangalore Coordinator',
      proposedAt: '2024-11-15T09:00:00Z',
      status: ProposalStatus.PENDING,
      taluka: 'Bangalore North',
      gramPanchayat: 'Hebbal',
      villageName: 'Gangenahalli',
      distanceFromCenter: 4.5,
      schoolName: 'Vishwa Shanti Vidya Mandir',
      schoolCategory: 'Aided',
      schoolStatus: 'Operational',
      completeAddress: 'No 45, Main Road, Hebbal, Bangalore - 560024',
      justification: 'School serves a high population of marginalized children with limited access to mental health support. HM is proactive and willing to designate space for counseling.',
      teachersMale: 8,
      teachersFemale: 12,
      teachersTotal: 20,
      class5Boys: 0, class5Girls: 0,
      class6Boys: 45, class6Girls: 42,
      class7Boys: 38, class7Girls: 40,
      class8Boys: 50, class8Girls: 48,
      class9Boys: 42, class9Girls: 45,
      grandTotalBoys: 175,
      grandTotalGirls: 175,
      grandTotalTotal: 350,
      groupsDivided: 4,
      strengthPerGroup: 88,
      totalEnrollment: 680,
      marginalizedPercentage: 75,
      sdqPercentage: 45,
      academicPerformancePercentage: 62,
      dropoutRatePercentage: 12,
      studentsRequiringSupport: 85,
      hasSchoolCounselor: false,
      hasSupportStaffSubstitution: true,
      hasProfessionalPartnership: false,
      teachersWillingPercentage: 90,
      proactiveAdministration: true,
      hasPhysicalSpace: true,
      hasBasicAmenities: true,
      amenitiesList: ['Drinking Water', 'Electricity', 'Infrastructure'],
      isHighRiskRegion: true,
      hasActiveSDMC: true,
      hasStaffInterest: true,
      overallSuitability: 'High',
      selectionComments: 'Priority 1 for Q1 2025 rollout.',
      estimatedBeneficiaries: 350
    }
  },
  {
    id: 'sr-mock-2',
    requestNumber: 'SR-002',
    districtId: 'd1',
    category: ServiceRequestCategory.INFRASTRUCTURE_SUPPORT,
    requestedBy: 'u2',
    requestedByName: 'Bangalore Coordinator',
    requestedAt: '2024-11-10T14:30:00Z',
    status: ProposalStatus.APPROVED,
    description: 'Requesting 2 additional portable counseling screens and 4 bean bags for the quiet room in St. Joseph High School.'
  }
];

export const MOCK_NOTICES: Notice[] = [
  {
    id: 'n1',
    title: 'Q4 Reporting Guidelines',
    message: 'Please ensure all children reach data is verified with school attendance registers before submission.',
    priority: NoticePriority.MEDIUM,
    targetRoles: [Role.DISTRICT_COORDINATOR],
    createdAt: new Date().toISOString(),
    createdBy: 'HQ Admin',
    isActive: true
  },
  {
    id: 'n2',
    title: 'System Maintenance',
    message: 'The portal will be offline for 2 hours on Sunday (Oct 15) for performance upgrades.',
    priority: NoticePriority.HIGH,
    targetRoles: [Role.DISTRICT_COORDINATOR, Role.BREADS_COORDINATOR],
    createdAt: new Date().toISOString(),
    createdBy: 'IT Team',
    isActive: true
  }
];

export const MOCK_REPORTS: BeneficiaryReport[] = [
  {
    id: 'rep_101',
    districtId: 'd1',
    month: '2024-11',
    year: 2024,
    submittedAt: '2024-11-02T10:00:00Z',
    submittedBy: 'Bangalore Coordinator',
    targetsReached: {
      [TargetGroup.CHILDREN]: 1200,
      [TargetGroup.PARENTS]: 850,
      [TargetGroup.PROFESSIONALS]: 4,
      [TargetGroup.TEACHERS]: 18,
      [TargetGroup.VOLUNTEERS]: 12,
    },
    activities: {
      educationModules: 10,
      campaigns: 1,
      therapyWorkshops: 2,
      counsellingSessions: 35,
      parentalTraining: 2,
    },
    narrativeImpact: "High engagement in urban schools for the anti-bullying campaign.",
    isLocked: false,
  },
  {
    id: 'rep_102',
    districtId: 'd3',
    month: '2024-11',
    year: 2024,
    submittedAt: '2024-11-03T11:30:00Z',
    submittedBy: 'Bidar Coordinator',
    targetsReached: {
      [TargetGroup.CHILDREN]: 800,
      [TargetGroup.PARENTS]: 450,
      [TargetGroup.PROFESSIONALS]: 2,
      [TargetGroup.TEACHERS]: 10,
      [TargetGroup.VOLUNTEERS]: 15,
    },
    activities: {
      educationModules: 6,
      campaigns: 2,
      therapyWorkshops: 1,
      counsellingSessions: 22,
      parentalTraining: 1,
    },
    narrativeImpact: "Rural outreach expanded to 3 new villages in the North district.",
    isLocked: false,
  }
];
