export interface Claim {
  id: string;
  patientName: string;
  patientDob: string;
  insuranceId: string;
  policyNumber: string;
  diagnosisCode: string;
  diagnosisDescription: string;
  treatmentDate: string;
  hospitalName: string;
  claimAmount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'In Review';
  submittedDate: string;
  adjusterNotes?: string;
  documents?: ClaimDocument[];
  timeline?: TimelineEvent[];
  providerId?: string;
}

export interface ClaimDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
}

export interface TimelineEvent {
  id: string;
  event: string;
  date: string;
  description: string;
  status: 'completed' | 'active' | 'pending' | 'rejected';
  actor?: string;
}

export interface ComplianceResult {
  score: number;
  status: 'compliant' | 'warning' | 'violation';
  issues: ComplianceIssue[];
  recommendations: string[];
  icdCodeValid: boolean;
  icdCodeDescription?: string;
  checkedAt: string;
}

export interface ComplianceIssue {
  id: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
  description: string;
  regulation: string;
  recommendation: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Adjuster' | 'Provider';
  avatar?: string;
  department?: string;
  phone?: string;
  joinDate?: string;
  notifications?: NotificationPreferences;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  claimUpdates: boolean;
  systemAlerts: boolean;
  weeklyReport: boolean;
}

export interface AnalyticsData {
  totalClaims: number;
  totalPayout: number;
  avgProcessingDays: number;
  approvalRate: number;
  monthlyData: MonthlyData[];
  statusBreakdown: StatusBreakdown[];
  topDiagnosisCodes: DiagnosisData[];
}

export interface MonthlyData {
  month: string;
  submitted: number;
  approved: number;
  rejected: number;
  amount: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface DiagnosisData {
  code: string;
  description: string;
  count: number;
  totalAmount: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
  read: boolean;
}
