// Quick Reference: Most Common API Calls
// Import these into your components as needed

import {
  authAPI,
  usersAPI,
  lawyersAPI,
  casesAPI,
  consultationsAPI,
  messagesAPI,
  citizensAPI,
  socialWorkersAPI
} from '@/services/api';

import type {
  UserResponse,
  LawyerResponse,
  CaseResponse,
  ConsultationResponse,
  DirectMessageResponse
} from '@/services/types';

/**
 * ============================================
 * AUTHENTICATION
 * ============================================
 */

// Login user
export const quickLogin = async (username: string, password: string) => {
  return authAPI.login(username, password);
};

// Register new user
export const quickRegister = async (
  username: string,
  email: string,
  password: string,
  userType: 'citizen' | 'lawyer' | 'social-worker'
) => {
  return authAPI.register({
    username,
    email,
    password,
    user_type: userType
  });
};

/**
 * ============================================
 * USER DATA
 * ============================================
 */

// Get current logged-in user
export const quickGetCurrentUser = async (): Promise<UserResponse> => {
  return usersAPI.getCurrentUser() as Promise<UserResponse>;
};

/**
 * ============================================
 * LAWYERS
 * ============================================
 */

// Get all lawyers with pagination
export const quickGetLawyers = async (page: number = 0, pageSize: number = 10) => {
  return lawyersAPI.getLawyers(page * pageSize, pageSize);
};

// Search lawyers by criteria
export const quickSearchLawyers = async (
  query?: string,
  specialization?: string,
  location?: string,
  minRating?: number,
  maxFee?: number
) => {
  return lawyersAPI.searchLawyers({
    query,
    specialization,
    location,
    min_rating: minRating,
    max_fee: maxFee,
    verified_only: true,
    skip: 0,
    limit: 20
  });
};

// Get lawyer profile with reviews
export const quickGetLawyerProfile = async (lawyerId: number) => {
  const lawyer = await lawyersAPI.getLawyerById(lawyerId);
  const details = await lawyersAPI.getLawyerDetails(lawyerId);
  return { lawyer, details };
};

// Get lawyer's availability
export const quickGetLawyerAvailability = async (lawyerId: number) => {
  return lawyersAPI.getAllAvailability();
};

// Get lawyer dashboard
export const quickGetLawyerDashboard = async () => {
  const [dashboard, stats, cases, earnings] = await Promise.all([
    lawyersAPI.getDashboard(),
    lawyersAPI.getDashboardStats(),
    lawyersAPI.getCasesSummary(),
    lawyersAPI.getEarningsSummary()
  ]);
  return { dashboard, stats, cases, earnings };
};

/**
 * ============================================
 * CASES
 * ============================================
 */

// Create new case
export const quickCreateCase = async (
  title: string,
  userId: number,
  lawyerId?: number,
  description?: string
) => {
  return casesAPI.createCase({
    title,
    description,
    user_id: userId,
    lawyer_id: lawyerId
  });
};

// Get user's cases
export const quickGetUserCases = async (userId: number) => {
  return casesAPI.getUserCases(userId, 0, 20);
};

// Get lawyer's cases
export const quickGetLawyerCases = async (lawyerId: number) => {
  return casesAPI.getLawyerCases(lawyerId, 0, 20);
};

// Get case details
export const quickGetCaseDetails = async (caseId: number) => {
  return casesAPI.getCaseById(caseId);
};

// Update case status
export const quickUpdateCaseStatus = async (caseId: number, status: string) => {
  return casesAPI.updateCase(caseId, { status });
};

/**
 * ============================================
 * CONSULTATIONS
 * ============================================
 */

// Create consultation
export const quickCreateConsultation = async (
  userId: number,
  lawyerId: number,
  scheduledAt?: string,
  feeAmount?: number
) => {
  return consultationsAPI.createConsultation({
    user_id: userId,
    lawyer_id: lawyerId,
    scheduled_at: scheduledAt,
    fee_amount: feeAmount
  });
};

// Get user's consultations
export const quickGetUserConsultations = async (userId: number) => {
  return consultationsAPI.getUserConsultations(userId, 0, 20);
};

// Get lawyer's consultations
export const quickGetLawyerConsultations = async (lawyerId: number) => {
  return consultationsAPI.getLawyerConsultations(lawyerId, 0, 20);
};

/**
 * ============================================
 * MESSAGES
 * ============================================
 */

// Send message to user
export const quickSendMessage = async (recipientId: number, message: string) => {
  return messagesAPI.sendMessage(recipientId, message);
};

// Get conversation with user
export const quickGetConversation = async (userId: number) => {
  return messagesAPI.getMessages(userId, 0, 50);
};

// Chat with AI
export const quickAskAI = async (question: string) => {
  return messagesAPI.createChatMessage(question, 'en');
};

/**
 * ============================================
 * CITIZENS
 * ============================================
 */

// Get citizen profile
export const quickGetCitizenProfile = async () => {
  return citizensAPI.getProfile();
};

// Update citizen profile
export const quickUpdateCitizenProfile = async (profileData: any) => {
  return citizensAPI.updateProfile(profileData);
};

// Get citizen dashboard
export const quickGetCitizenDashboard = async () => {
  const [dashboard, stats, cases, consultations] = await Promise.all([
    citizensAPI.getDashboard(),
    citizensAPI.getDashboardStats(),
    citizensAPI.getCasesSummary(),
    citizensAPI.getConsultationsSummary()
  ]);
  return { dashboard, stats, cases, consultations };
};

// Upload document
export const quickUploadDocument = async (
  file: File,
  caseId?: number,
  documentType?: string
) => {
  return citizensAPI.uploadDocument(file, caseId, documentType);
};

// Create review for lawyer
export const quickCreateReview = async (
  lawyerId: number,
  rating: number,
  reviewText?: string
) => {
  return citizensAPI.createReview({
    lawyer_id: lawyerId,
    rating,
    review_text: reviewText
  });
};

// Create payment
export const quickCreatePayment = async (
  lawyerId: number,
  amount: number,
  paymentMethod: string
) => {
  return citizensAPI.createPayment({
    lawyer_id: lawyerId,
    amount,
    payment_method: paymentMethod
  });
};

/**
 * ============================================
 * SOCIAL WORKERS
 * ============================================
 */

// Get social worker profile
export const quickGetSocialWorkerProfile = async () => {
  return socialWorkersAPI.getProfile();
};

// Create referral
export const quickCreateReferral = async (
  lawyerId: number,
  citizenId: number,
  reason?: string
) => {
  return socialWorkersAPI.createReferral({
    lawyer_id: lawyerId,
    citizen_id: citizenId,
    referral_reason: reason
  });
};

// Get social worker's referrals
export const quickGetReferrals = async () => {
  return socialWorkersAPI.listReferrals(0, 20);
};

// Get social worker dashboard
export const quickGetSocialWorkerDashboard = async () => {
  const [dashboard, stats, impact] = await Promise.all([
    socialWorkersAPI.getDashboard(),
    socialWorkersAPI.getDashboardStats(),
    socialWorkersAPI.getImpactReport(30)
  ]);
  return { dashboard, stats, impact };
};

// Get approved lawyers for referral
export const quickGetApprovedLawyers = async (specialization?: string) => {
  return socialWorkersAPI.getApprovedLawyers(specialization, 0, 20);
};

// Update referral status
export const quickUpdateReferralStatus = async (
  referralId: number,
  status: string,
  outcome?: string
) => {
  return socialWorkersAPI.updateReferral(referralId, {
    status,
    outcome
  });
};

/**
 * ============================================
 * UTILITY HOOKS (For React Components)
 * ============================================
 */

import { useEffect, useState } from 'react';

// Hook: Get lawyer with details
export const useLawyerProfile = (lawyerId: number) => {
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    quickGetLawyerProfile(lawyerId)
      .then(setLawyer)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [lawyerId]);

  return { lawyer, loading, error };
};

// Hook: Get user cases
export const useUserCases = (userId: number) => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    quickGetUserCases(userId)
      .then(setCases)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { cases, loading, error };
};

// Hook: Get current user
export const useCurrentUser = () => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    quickGetCurrentUser()
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
};

// Hook: Get conversation
export const useConversation = (userId: number) => {
  const [messages, setMessages] = useState<DirectMessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    quickGetConversation(userId)
      .then(setMessages)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { messages, loading, error };
};

/**
 * ============================================
 * CITIZEN SERVICE (Advanced)
 * ============================================
 *
 * For more comprehensive citizen operations with built-in error handling,
 * use the CitizenService class instead of the quick functions above.
 */

import { CitizenService, LawyerRegistrationService } from '@/services/citizenService';

// Lawyer registration with citizen profile creation
export const quickRegisterLawyer = async (lawyerData: {
  username: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  specialization?: string;
  experience?: number;
  bio?: string;
}) => {
  return LawyerRegistrationService.registerLawyerWithCitizenProfile(lawyerData);
};

// Ensure lawyer has both profiles
export const quickEnsureLawyerProfiles = async (userId: number) => {
  return LawyerRegistrationService.ensureLawyerProfiles(userId);
};

// Get or create citizen profile
export const quickGetOrCreateCitizenProfile = async () => {
  return CitizenService.getOrCreateCitizenProfile();
};

// Full citizen dashboard with all data
export const quickGetCitizenDashboardFull = async () => {
  const [dashboard, stats, cases, consultations, activity] = await Promise.all([
    CitizenService.getDashboard(),
    CitizenService.getDashboardStats(),
    CitizenService.getCasesSummary(),
    CitizenService.getConsultationsSummary(),
    CitizenService.getActivitySummary(30)
  ]);
  return { dashboard, stats, cases, consultations, activity };
};

// Upload document with error handling
export const quickUploadDocumentSafe = async (file: File, caseId?: number) => {
  try {
    return await CitizenService.uploadDocument(file, caseId, 'legal_document');
  } catch (error) {
    console.error('Document upload failed:', error);
    throw error;
  }
};

// Create review with validation
export const quickCreateReviewSafe = async (
  lawyerId: number,
  rating: number,
  reviewText: string
) => {
  try {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    return await CitizenService.createReview({
      lawyer_id: lawyerId,
      rating,
      review_text: reviewText
    });
  } catch (error) {
    console.error('Review creation failed:', error);
    throw error;
  }
};

// Set up 2FA
export const quickSetup2FA = async (authMethod: 'totp' | 'sms' = 'totp') => {
  try {
    return await CitizenService.setup2FA(authMethod.toUpperCase());
  } catch (error) {
    console.error('2FA setup failed:', error);
    throw error;
  }
};

/**
 * ============================================
 * USAGE EXAMPLES
 * ============================================
 */

/*

// In a React component:

import { quickGetLawyers, quickCreateCase } from '@/services/api-quick-ref';

export function FindLawyersPage() {
  const [lawyers, setLawyers] = useState([]);

  useEffect(() => {
    quickGetLawyers(0, 10).then(setLawyers);
  }, []);

  return (
    <div>
      {lawyers.map(lawyer => (
        <LawyerCard key={lawyer.id} lawyer={lawyer} />
      ))}
    </div>
  );
}

// Create a case:

const caseData = await quickCreateCase(
  'Property Dispute',
  userId,
  lawyerId,
  'Dispute over property ownership'
);

// Search lawyers:

const results = await quickSearchLawyers(
  'criminal', // query
  'Criminal Law', // specialization
  'Delhi', // location
  4, // min rating
  10000 // max fee
);

*/
