// Types for Citizen Dashboard Cases Summary API
export interface CitizenCaseSummary {
  id: number;
  title: string;
  lawyer: string;
  status: string;
  nextHearing: string | null;
  description: string;
}
