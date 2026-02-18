
import { 
  User, 
  BeneficiaryReport, 
  Area, 
  District, 
  School, 
  HealthProgram, 
  Notice, 
  SchoolProposal,
  SchoolMonthlyReport,
  MonthlyPlanItem,
  TargetGroup,
  Role,
  UserStatus,
  SystemLog,
  MindsActivityRecord,
  ServiceRequest
} from '../types';
import { 
  MOCK_USERS, 
  MOCK_REPORTS, 
  INITIAL_AREAS, 
  INITIAL_DISTRICTS, 
  INITIAL_SCHOOLS, 
  INITIAL_HEALTH_PROGRAMS, 
  MOCK_NOTICES,
  MOCK_SERVICE_REQUESTS
} from '../constants';

const STORAGE_KEYS = {
  USERS: 'minds_db_users',
  REPORTS: 'minds_db_reports',
  AREAS: 'minds_db_areas',
  DISTRICTS: 'minds_db_districts',
  SCHOOLS: 'minds_db_schools',
  PROGRAMS: 'minds_db_programs',
  NOTICES: 'minds_db_notices',
  PROPOSALS: 'minds_db_proposals',
  SERVICE_REQUESTS: 'minds_db_service_requests',
  SETTINGS: 'minds_db_settings',
  SCHOOL_REPORTS: 'minds_db_school_reports',
  MONTHLY_PLANS: 'minds_db_monthly_plans',
  SYSTEM_LOGS: 'minds_db_system_logs',
  MINDS_ACTIVITY_REPORTS: 'minds_db_activity_records'
};

class DatabaseService {
  private simulateLatency = 400;

  private async wait() {
    return new Promise(resolve => setTimeout(resolve, this.simulateLatency));
  }

  private getItem<T>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }

  private setItem(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async initialize() {
    await this.wait();
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) this.setItem(STORAGE_KEYS.USERS, MOCK_USERS);
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) this.setItem(STORAGE_KEYS.REPORTS, MOCK_REPORTS);
    if (!localStorage.getItem(STORAGE_KEYS.AREAS)) this.setItem(STORAGE_KEYS.AREAS, INITIAL_AREAS);
    if (!localStorage.getItem(STORAGE_KEYS.DISTRICTS)) this.setItem(STORAGE_KEYS.DISTRICTS, INITIAL_DISTRICTS);
    if (!localStorage.getItem(STORAGE_KEYS.SCHOOLS)) this.setItem(STORAGE_KEYS.SCHOOLS, INITIAL_SCHOOLS);
    if (!localStorage.getItem(STORAGE_KEYS.PROGRAMS)) this.setItem(STORAGE_KEYS.PROGRAMS, INITIAL_HEALTH_PROGRAMS);
    if (!localStorage.getItem(STORAGE_KEYS.NOTICES)) this.setItem(STORAGE_KEYS.NOTICES, MOCK_NOTICES);
    if (!localStorage.getItem(STORAGE_KEYS.PROPOSALS)) this.setItem(STORAGE_KEYS.PROPOSALS, []);
    if (!localStorage.getItem(STORAGE_KEYS.SERVICE_REQUESTS)) this.setItem(STORAGE_KEYS.SERVICE_REQUESTS, MOCK_SERVICE_REQUESTS);
    if (!localStorage.getItem(STORAGE_KEYS.SCHOOL_REPORTS)) this.setItem(STORAGE_KEYS.SCHOOL_REPORTS, []);
    if (!localStorage.getItem(STORAGE_KEYS.MONTHLY_PLANS)) this.setItem(STORAGE_KEYS.MONTHLY_PLANS, []);
    if (!localStorage.getItem(STORAGE_KEYS.SYSTEM_LOGS)) this.setItem(STORAGE_KEYS.SYSTEM_LOGS, []);
    if (!localStorage.getItem(STORAGE_KEYS.MINDS_ACTIVITY_REPORTS)) this.setItem(STORAGE_KEYS.MINDS_ACTIVITY_REPORTS, []);
    
    return {
      users: this.getItem(STORAGE_KEYS.USERS, MOCK_USERS),
      reports: this.getItem(STORAGE_KEYS.REPORTS, MOCK_REPORTS),
      areas: this.getItem(STORAGE_KEYS.AREAS, INITIAL_AREAS),
      districts: this.getItem(STORAGE_KEYS.DISTRICTS, INITIAL_DISTRICTS),
      schools: this.getItem(STORAGE_KEYS.SCHOOLS, INITIAL_SCHOOLS),
      programs: this.getItem(STORAGE_KEYS.PROGRAMS, INITIAL_HEALTH_PROGRAMS),
      notices: this.getItem(STORAGE_KEYS.NOTICES, MOCK_NOTICES),
      proposals: this.getItem(STORAGE_KEYS.PROPOSALS, []),
      serviceRequests: this.getItem(STORAGE_KEYS.SERVICE_REQUESTS, MOCK_SERVICE_REQUESTS),
      schoolMonthlyReports: this.getItem(STORAGE_KEYS.SCHOOL_REPORTS, []),
      monthlyPlanItems: this.getItem(STORAGE_KEYS.MONTHLY_PLANS, []),
      systemLogs: this.getItem(STORAGE_KEYS.SYSTEM_LOGS, []),
      mindsActivityRecords: this.getItem(STORAGE_KEYS.MINDS_ACTIVITY_REPORTS, []),
      settings: this.getItem(STORAGE_KEYS.SETTINGS, { deadlineDay: 5, annualTargets: {} })
    };
  }

  async saveUsers(users: any[]) {
    await this.wait();
    this.setItem(STORAGE_KEYS.USERS, users);
  }

  async saveReports(reports: BeneficiaryReport[]) {
    await this.wait();
    this.setItem(STORAGE_KEYS.REPORTS, reports);
  }

  async saveServiceRequests(requests: ServiceRequest[]) {
    await this.wait();
    this.setItem(STORAGE_KEYS.SERVICE_REQUESTS, requests);
  }

  async saveSchoolMonthlyReports(reports: SchoolMonthlyReport[]) {
    await this.wait();
    this.setItem(STORAGE_KEYS.SCHOOL_REPORTS, reports);
  }

  async saveMonthlyPlanItems(items: MonthlyPlanItem[]) {
    await this.wait();
    this.setItem(STORAGE_KEYS.MONTHLY_PLANS, items);
  }

  async saveMindsActivityRecords(records: MindsActivityRecord[]) {
    await this.wait();
    this.setItem(STORAGE_KEYS.MINDS_ACTIVITY_REPORTS, records);
  }

  async saveHierarchy(areas: Area[], districts: District[], schools: School[]) {
    await this.wait();
    this.setItem(STORAGE_KEYS.AREAS, areas);
    this.setItem(STORAGE_KEYS.DISTRICTS, districts);
    this.setItem(STORAGE_KEYS.SCHOOLS, schools);
  }

  async saveCatalog(programs: HealthProgram[]) {
    await this.wait();
    this.setItem(STORAGE_KEYS.PROGRAMS, programs);
  }

  async saveNotices(notices: Notice[]) {
    await this.wait();
    this.setItem(STORAGE_KEYS.NOTICES, notices);
  }

  async saveProposals(proposals: SchoolProposal[]) {
    await this.wait();
    this.setItem(STORAGE_KEYS.PROPOSALS, proposals);
  }

  async saveSystemLogs(logs: SystemLog[]) {
    await this.wait();
    this.setItem(STORAGE_KEYS.SYSTEM_LOGS, logs);
  }

  async saveSettings(settings: any) {
    await this.wait();
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  async resetDatabase() {
    await this.wait();
    const logs = this.getItem(STORAGE_KEYS.SYSTEM_LOGS, []);
    localStorage.clear();
    this.setItem(STORAGE_KEYS.SYSTEM_LOGS, logs);
    return this.initialize();
  }
}

export const database = new DatabaseService();
