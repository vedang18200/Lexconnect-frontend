// ============================================
// AUTH TYPES
// ============================================
export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: number;
  user_type: 'citizen' | 'lawyer' | 'social-worker';
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// ============================================
// USER TYPES
// ============================================
export interface UserCreate {
  username: string;
  email: string;
  user_type: 'citizen' | 'lawyer' | 'social-worker';
  password: string;
  phone?: string;
  location?: string;
  language?: string;
}

export interface UserUpdate {
  email?: string;
  phone?: string;
  location?: string;
  language?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  user_type: 'citizen' | 'lawyer' | 'social-worker';
  phone?: string;
  location?: string;
  language?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserListResponse {
  id: number;
  username: string;
  email: string;
  user_type: string;
  is_active: boolean;
  created_at: string;
}

// ============================================
// LAWYER TYPES
// ============================================
export interface LawyerCreate {
  name: string;
  email?: string;
  phone?: string;
  specialization?: string;
  experience?: number;
  location?: string;
  bio?: string;
  fee_range?: string;
  languages?: string;
  user_id: number;
}

export interface LawyerUpdate {
  specialization?: string;
  experience?: number;
  location?: string;
  bio?: string;
  fee_range?: string;
  languages?: string;
}

export interface LawyerResponse {
  id: number;
  user_id: number;
  name: string;
  email?: string;
  phone?: string;
  specialization?: string;
  experience?: number;
  location?: string;
  bio?: string;
  fee_range?: string;
  fee_per_hour?: number;
  languages?: string | string[];
  rating?: number;
  review_count?: number;
  verified: boolean;
  total_cases: number;
  total_clients: number;
  availability?: string;
  response_time?: string;
  specializations?: string[];
  cases_won?: number;
  success_rate?: number;
  effective_rating?: number;
  available_via?: string[];
  next_slot_available?: string;
  top_achievement?: string;
  created_at: string;
  updated_at?: string;
}

export interface ReviewData {
  id: number;
  rating: number;
  title: string;
  review_text: string;
  communication_rating?: number;
  professionalism_rating?: number;
  effectiveness_rating?: number;
  citizen_name: string;
  created_at: string;
  is_verified_client?: boolean;
}

export interface ReviewsSummary {
  total_reviews: number;
  average_rating: number;
  effective_rating: number;
  rating_distribution: {
    [key: string]: number;
  };
}

export interface AchievementData {
  title: string;
  year: string;
  issuer: string;
}

export interface OverviewData {
  bio?: string;
  experience?: number;
  availability?: string;
  specializations?: string[];
  languages?: string[];
  education?: string[];
  credentials?: string;
  bar_council_id?: string;
  rating?: number;
  review_count?: number;
  cases_won?: number;
  success_rate?: number;
  clients_satisfied?: number;
}

export interface LawyerProfileResponse extends LawyerResponse {
  clients_satisfied?: number;
  bar_council_id?: string;
  credentials?: string;
  education?: string[];
  reviews_summary?: ReviewsSummary;
  overview_data?: OverviewData;
  reviews_data?: ReviewData[];
  achievements_data?: AchievementData[];
}

export interface LawyerCredentialCreate {
  license_number: string;
  license_state?: string;
  bar_association?: string;
  bar_admission_year?: number;
  qualifications?: string;
  court_admissions?: string;
}

export interface LawyerCredentialResponse {
  id: number;
  lawyer_id: number;
  license_number: string;
  license_state?: string;
  bar_association?: string;
  bar_admission_year?: number;
  qualifications?: string;
  court_admissions?: string;
  is_verified: boolean;
  verified_at?: string;
  verification_documents?: string;
  created_at: string;
  updated_at?: string;
}

export interface LawyerAvailabilityCreate {
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  is_available?: boolean;
  slot_duration_minutes?: number;
  break_start?: string;
  break_end?: string;
}

export interface LawyerAvailabilityResponse {
  id: number;
  lawyer_id: number;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  is_available: boolean;
  slot_duration_minutes: number;
  break_start?: string;
  break_end?: string;
  date_specific?: string;
  created_at: string;
  updated_at?: string;
}

// ============================================
// CASE TYPES
// ============================================
export interface CaseCreate {
  title: string;
  description?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  case_number?: string;
  user_id: number;
  lawyer_id?: number;
}

export interface CaseUpdate {
  title?: string;
  description?: string;
  category?: string;
  status?: string;
  priority?: string;
  lawyer_id?: number;
}

export interface CaseResponse {
  id: number;
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  case_number?: string;
  user_id: number;
  lawyer_id?: number;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface CaseNoteCreate {
  note_type?: string;
  title?: string;
  content: string;
  is_private?: boolean;
  priority?: string;
  due_date?: string;
  case_id: number;
}

export interface CaseNoteResponse {
  id: number;
  case_id: number;
  lawyer_id: number;
  note_type?: string;
  title?: string;
  content: string;
  is_private: boolean;
  priority?: string;
  due_date?: string;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at?: string;
}

// My Cases - Lawyer Info
export interface CaseLawyerInfo {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
}

// My Cases - Detailed Case
export interface MyCasesResponse {
  id: number;
  user_id: number;
  lawyer_id: number;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in_progress' | 'active' | 'pending' | 'closed' | 'resolved';
  priority: 'low' | 'medium' | 'high' | null;
  case_number: string;
  created_at: string;
  updated_at: string;
  lawyer: CaseLawyerInfo;
  court_name?: string;
  hearing_date?: string | null;
  estimated_completion_date?: string | null;
  case_progress?: number;
  documents_count: number;
  updates_count: number;
  legal_fees_amount: number;
  legal_fees_paid: number;
}

// My Cases - List Response
export interface MyCasesListResponse {
  total: number;
  page: number;
  cases: MyCasesResponse[];
}

// My Cases - Statistics
export interface CaseStatistics {
  total_cases: number;
  active_cases: number;
  pending_cases: number;
  closed_cases: number;
  resolved_cases: number;
}

// ============================================
// CONSULTATION TYPES
// ============================================
export interface ConsultationCreate {
  consultation_type?: string;
  duration_minutes?: number;
  fee_amount?: number;
  notes?: string;
  user_id: number;
  lawyer_id: number;
  scheduled_at?: string;
}

export interface ConsultationUpdate {
  status?: string;
  consultation_date?: string;
  duration_minutes?: number;
  fee_amount?: number;
  notes?: string;
}

export interface ConsultationResponse {
  id: number;
  user_id: number;
  lawyer_id: number;
  consultation_type?: string;
  duration_minutes?: number;
  fee_amount?: number;
  notes?: string;
  status: string;
  scheduled_at?: string;
  consultation_date?: string;
  created_at: string;
  updated_at?: string;
}

// ============================================
// MESSAGE TYPES
// ============================================
export interface DirectMessageCreate {
  receiver_id: number;
  message: string;
}

export interface DirectMessageResponse {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  sent_at: string;
  read_at?: string;
}

export interface ChatMessageCreate {
  message: string;
  language?: string;
}

export interface ChatMessageResponse {
  id: number;
  user_id: number;
  message: string;
  response?: string;
  language: string;
  created_at: string;
}

// ============================================
// CITIZEN TYPES
// ============================================
export interface CitizenProfileUpdate {
  full_name?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  bio?: string;
  occupation?: string;
  email?: string;
  phone?: string;
  aadhar_number?: string;
  profile_picture_url?: string;
}

export interface CitizenProfileResponse {
  id: number;
  user_id: number;
  full_name?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  bio?: string;
  occupation?: string;
  email?: string;
  phone?: string;
  aadhar_number_masked?: string;
  profile_picture_url?: string;
  is_kyc_verified: boolean;
  kyc_verified_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface NotificationPreferencesResponse {
  email_notifications: boolean;
  sms_notifications: boolean;
  case_updates: boolean;
  consultation_reminders: boolean;
  payment_alerts: boolean;
  marketing_emails: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BillingHistoryItemResponse {
  id: number;
  title: string;
  date: string;
  payment_method: string;
  transaction_id: string;
  amount: number;
  currency?: string;
  status: string;
}

export interface BillingHistoryResponse {
  items: BillingHistoryItemResponse[];
  total: number;
  summary?: {
    total_spent: number;
    currency?: string;
  };
}

export interface DocumentUploadResponse {
  id: number;
  user_id: number;
  case_id?: number;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  document_type?: string;
  description?: string;
  file_url: string;
  is_verified: boolean;
  uploaded_at: string;
  updated_at?: string;
}

export interface LawyerReviewCreate {
  rating: number;
  title?: string;
  review_text?: string;
  communication_rating?: number;
  professionalism_rating?: number;
  effectiveness_rating?: number;
  lawyer_id: number;
  case_id?: number;
}

export interface LawyerReviewResponse {
  id: number;
  lawyer_id: number;
  citizen_id: number;
  rating: number;
  title?: string;
  review_text?: string;
  communication_rating?: number;
  professionalism_rating?: number;
  effectiveness_rating?: number;
  case_id?: number;
  is_verified_client: boolean;
  helpful_count: number;
  unhelpful_count: number;
  created_at: string;
  updated_at?: string;
}

export interface PaymentCreate {
  amount: number;
  payment_method: string;
  description?: string;
  lawyer_id: number;
  consultation_id?: number;
  case_id?: number;
}

export interface PaymentResponse {
  id: number;
  citizen_id: number;
  lawyer_id: number;
  amount: number;
  payment_method: string;
  description?: string;
  consultation_id?: number;
  case_id?: number;
  status: string;
  transaction_id?: string;
  paid_at?: string;
  confirmed_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface TwoFactorAuthSetup {
  auth_method: string;
  phone_number?: string;
}

export interface TwoFactorAuthVerify {
  code: string;
}

export interface TwoFactorAuthResponse {
  id: number;
  user_id: number;
  auth_method?: string;
  phone_number?: string;
  is_enabled: boolean;
  verified_at?: string;
  created_at: string;
}

// ============================================
// INVOICE TYPES
// ============================================
export interface InvoiceCreate {
  amount: number;
  tax_percentage?: number;
  tax_amount?: number;
  total_amount: number;
  description?: string;
  due_date?: string;
  notes?: string;
  citizen_id: number;
  case_id?: number;
  consultation_id?: number;
}

export interface InvoiceResponse {
  id: number;
  lawyer_id: number;
  citizen_id: number;
  amount: number;
  tax_percentage?: number;
  tax_amount?: number;
  total_amount: number;
  description?: string;
  due_date?: string;
  notes?: string;
  case_id?: number;
  consultation_id?: number;
  invoice_number: string;
  status: string;
  issued_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at?: string;
}

// ============================================
// TEMPLATE TYPES
// ============================================
export interface DocumentTemplateCreate {
  name: string;
  description?: string;
  template_type: string;
  content: string;
  is_public?: boolean;
  category?: string;
  tags?: string;
}

export interface DocumentTemplateResponse {
  id: number;
  lawyer_id: number;
  name: string;
  description?: string;
  template_type: string;
  content: string;
  is_public: boolean;
  category?: string;
  tags?: string;
  usage_count: number;
  created_at: string;
  updated_at?: string;
}

// ============================================
// SOCIAL WORKER TYPES
// ============================================
export interface SocialWorkerProfileCreate {
  agency_id: number;
  license_number?: string;
  specialization?: string;
  bio?: string;
}

export interface SocialWorkerProfileUpdate {
  license_number?: string;
  specialization?: string;
  bio?: string;
}

export interface SocialWorkerProfileResponse {
  id: number;
  user_id: number;
  agency_id: number;
  license_number?: string;
  specialization?: string;
  bio?: string;
  is_verified: boolean;
  verified_at?: string;
  total_referrals: number;
  successful_referrals: number;
  created_at: string;
  updated_at: string;
}

export interface ReferralCreate {
  lawyer_id: number;
  citizen_id: number;
  referral_reason?: string;
  case_category?: string;
}

export interface ReferralUpdate {
  status?: string;
  outcome?: string;
  outcome_notes?: string;
}

export interface ReferralResponse {
  id: number;
  social_worker_id: number;
  lawyer_id: number;
  citizen_id: number;
  case_id?: number;
  referral_reason?: string;
  case_category?: string;
  status: string;
  outcome?: string;
  outcome_notes?: string;
  referral_date: string;
  accepted_date?: string;
  completed_date?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// DASHBOARD TYPES
// ============================================

// Citizen Dashboard
export interface CaseSummaryItem {
  id: number;
  title: string;
  status: string;
  priority: string;
  lawyer_name?: string;
  last_updated?: string;
}

export interface CitizenDashboardStats {
  active_cases: number;
  resolved_cases: number;
  total_spent: number;
  pending_payments: number;
  upcoming_consultations: number;
}

export interface ConsultationSummary {
  total_consultations: number;
  completed: number;
  pending: number;
  upcoming: number;
}

export interface CitizenDashboard {
  stats: CitizenDashboardStats;
  cases_summary: CaseSummaryItem[];
  consultation_summary: ConsultationSummary;
  recent_activity?: ActivityItem[];
}

export interface ActivityItem {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  related_id?: number;
}

export interface ActivitySummary {
  period_days: number;
  total_activities: number;
  by_type: Record<string, number>;
  activities: ActivityItem[];
}

// Lawyer Dashboard
export interface LawyerDashboard {
  total_cases: number;
  active_cases: number;
  completed_cases: number;
  pending_consultations: number;
  total_earnings: number;
  average_rating: number;
  total_clients: number;
}

export interface EarningsSummary {
  month_earnings: number;
  year_earnings: number;
  total_earnings: number;
  pending_payments: number;
}

export interface ClientsAnalytics {
  total_clients: number;
  new_clients_this_month: number;
  repeat_clients: number;
  client_satisfaction: number;
}

export interface ConsultationsAnalytics {
  total_consultations: number;
  completed: number;
  pending: number;
  average_duration: number;
  average_rating: number;
}

export interface PerformanceMetrics {
  case_resolution_rate: number;
  average_case_duration_days: number;
  client_satisfaction_score: number;
  response_time_hours: number;
}

// Social Worker Dashboard
export interface SocialWorkerDashboard {
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  total_clients_served: number;
  agencies_count: number;
}

export interface ImpactReport {
  period_days: number;
  total_referrals: number;
  successful_referrals: number;
  clients_assisted: number;
  case_categories: Record<string, number>;
  success_rate: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface APIError {
  message: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}
