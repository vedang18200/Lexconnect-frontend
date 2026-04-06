export type ConsultationStatus =
  | 'all'
  | 'scheduled'
  | 'completed'
  | 'cancelled';

export type ConsultationMode =
  | 'all'
  | 'video'
  | 'phone'
  | 'chat'
  | string;

export interface LawyerInfo {
  id?: number;
  name: string;
  initials?: string;
  specialization?: string;
  rating?: number;
}

export interface CaseInfo {
  id?: number;
  title?: string;
  case_code?: string;
}

export interface FeeInfo {
  amount: number;
  payment_status?: string;
  currency?: string;
}

export interface AttachmentInfo {
  id?: number | string;
  name: string;
  url?: string;
}

export interface ActionFlags {
  can_join_meeting?: boolean;
  can_reschedule?: boolean;
  can_cancel?: boolean;
  can_view_details?: boolean;
}

export interface ConsultationCard {
  id: number;
  consultation_code?: string;
  status: string;
  consultation_mode?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  note?: string;
  attachments?: AttachmentInfo[];
  lawyer?: LawyerInfo;
  case?: CaseInfo;
  fee?: FeeInfo;
  actions?: ActionFlags;
  meeting_url?: string;
}

export interface ConsultationSummaryResponse {
  summary: {
    total: number;
    upcoming: number;
    completed: number;
    cancelled: number;
  };
  consultations: ConsultationCard[];
  filters?: {
    status?: string;
    mode?: string;
    q?: string;
    skip?: number;
    limit?: number;
  };
  pagination?: {
    skip: number;
    limit: number;
    total: number;
    returned: number;
  };
  status_breakdown?: Record<string, number>;
  type_breakdown?: Record<string, number>;
  total_fee_spent?: number;
}

export interface ConsultationDetailLawyerInformation {
  id?: number;
  initials?: string;
  name: string;
  specialization?: string;
  rating?: number;
}

export interface ConsultationDetailCaseInformation {
  id?: number;
  title?: string;
}

export interface ConsultationDetailFeeInformation {
  amount?: number;
  currency?: string;
}

export interface ConsultationDetailDocument {
  id?: number | string;
  name: string;
  url?: string;
  mime_type?: string;
  size?: number;
  uploaded_at?: string;
}

export interface ConsultationDetailActions {
  can_view_details?: boolean;
  can_join_meeting?: boolean;
  can_reschedule?: boolean;
  can_cancel?: boolean;
}

export interface ConsultationDetailResponse {
  id: number;
  consultation_code: string;
  status: string;
  lawyer_information: ConsultationDetailLawyerInformation;
  consultation_details: {
    date_time?: string;
    duration_minutes?: number;
    mode?: string;
    fee?: ConsultationDetailFeeInformation;
    related_case?: ConsultationDetailCaseInformation;
    meeting_link?: string;
  };
  preparation_notes?: string;
  documents?: ConsultationDetailDocument[];
  payment_information?: {
    consultation_fee?: number;
    currency?: string;
    status?: string;
  };
  actions?: ConsultationDetailActions;
}

// Backward-compatible type used by the citizen dashboard summary widgets.
export interface CitizenConsultationsSummary {
  total_consultations: number;
  status_breakdown: Record<string, number>;
  type_breakdown: Record<string, number>;
  total_fee_spent: number;
}
