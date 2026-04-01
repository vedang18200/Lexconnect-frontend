// Types for Citizen Dashboard Consultations Summary API
export interface CitizenConsultationsSummary {
  total_consultations: number;
  status_breakdown: Record<string, number>;
  type_breakdown: Record<string, number>;
  total_fee_spent: number;
}
