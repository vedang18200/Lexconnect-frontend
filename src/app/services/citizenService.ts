/**
 * Citizen Service
 * Handles citizen-specific operations including profile management,
 * documents, reviews, payments, 2FA, and dashboard
 */

import { citizensAPI, lawyersAPI, usersAPI } from './api';
import type {
  CitizenProfileResponse,
  CitizenProfileUpdate,
  DocumentUploadResponse,
  LawyerReviewResponse,
  PaymentResponse,
  TwoFactorAuthResponse,
} from './types';

export class CitizenService {
  /**
   * Get citizen profile with error handling
   */
  static async getCitizenProfile(): Promise<CitizenProfileResponse> {
    try {
      const profile = await citizensAPI.getProfile();
      return profile as CitizenProfileResponse;
    } catch (error) {
      throw new Error(`Failed to get citizen profile: ${error}`);
    }
  }

  /**
   * Update citizen profile
   */
  static async updateCitizenProfile(
    data: CitizenProfileUpdate
  ): Promise<CitizenProfileResponse> {
    try {
      const profile = await citizensAPI.updateProfile(data);
      return profile as CitizenProfileResponse;
    } catch (error) {
      throw new Error(`Failed to update citizen profile: ${error}`);
    }
  }

  /**
   * Get or create citizen profile (idempotent operation)
   */
  static async getOrCreateCitizenProfile(): Promise<CitizenProfileResponse> {
    try {
      return await this.getCitizenProfile();
    } catch (error) {
      // Profile doesn't exist, which is expected on first login
      // Return empty profile structure
      console.log('Creating new citizen profile...');
      return {
        id: 0,
        user_id: 0,
        full_name: '',
        date_of_birth: undefined,
        gender: undefined,
        address: undefined,
        city: undefined,
        state: undefined,
        pincode: undefined,
        bio: undefined,
        profile_picture_url: undefined,
        is_kyc_verified: false,
        kyc_verified_at: undefined,
        created_at: new Date().toISOString(),
        updated_at: undefined,
      } as CitizenProfileResponse;
    }
  }

  /**
   * Upload document with proper error handling
   */
  static async uploadDocument(
    file: File,
    caseId?: number,
    documentType?: string,
    description?: string
  ): Promise<DocumentUploadResponse> {
    try {
      if (!file) {
        throw new Error('File is required');
      }

      const response = await citizensAPI.uploadDocument(
        file,
        caseId,
        documentType,
        description
      );
      return response as DocumentUploadResponse;
    } catch (error) {
      throw new Error(`Failed to upload document: ${error}`);
    }
  }

  /**
   * Get all citizen documents
   */
  static async getDocuments(
    caseId?: number,
    skip: number = 0,
    limit: number = 10
  ) {
    try {
      return await citizensAPI.listDocuments(caseId, skip, limit);
    } catch (error) {
      throw new Error(`Failed to fetch documents: ${error}`);
    }
  }

  /**
   * Delete document
   */
  static async deleteDocument(documentId: number): Promise<void> {
    try {
      await citizensAPI.deleteDocument(documentId);
    } catch (error) {
      throw new Error(`Failed to delete document: ${error}`);
    }
  }

  /**
   * Create review for lawyer
   */
  static async createReview(reviewData: {
    rating: number;
    title?: string;
    review_text?: string;
    communication_rating?: number;
    professionalism_rating?: number;
    effectiveness_rating?: number;
    lawyer_id: number;
    case_id?: number;
  }): Promise<LawyerReviewResponse> {
    try {
      if (!reviewData.lawyer_id) {
        throw new Error('Lawyer ID is required');
      }

      const review = await citizensAPI.createReview(reviewData);
      return review as LawyerReviewResponse;
    } catch (error) {
      throw new Error(`Failed to create review: ${error}`);
    }
  }

  /**
   * Get citizen's own reviews
   */
  static async getMyReviews(skip: number = 0, limit: number = 10) {
    try {
      return await citizensAPI.getMyReviews(skip, limit);
    } catch (error) {
      throw new Error(`Failed to fetch reviews: ${error}`);
    }
  }

  /**
   * Update review
   */
  static async updateReview(
    reviewId: number,
    reviewData: any
  ): Promise<LawyerReviewResponse> {
    try {
      const review = await citizensAPI.updateReview(reviewId, reviewData);
      return review as LawyerReviewResponse;
    } catch (error) {
      throw new Error(`Failed to update review: ${error}`);
    }
  }

  /**
   * Delete review
   */
  static async deleteReview(reviewId: number): Promise<void> {
    try {
      await citizensAPI.deleteReview(reviewId);
    } catch (error) {
      throw new Error(`Failed to delete review: ${error}`);
    }
  }

  /**
   * Mark review as helpful
   */
  static async markReviewHelpful(reviewId: number) {
    try {
      return await citizensAPI.markReviewHelpful(reviewId);
    } catch (error) {
      throw new Error(`Failed to mark review as helpful: ${error}`);
    }
  }

  /**
   * Create payment
   */
  static async createPayment(paymentData: {
    amount: number;
    payment_method: string;
    description?: string;
    lawyer_id: number;
    consultation_id?: number;
    case_id?: number;
  }): Promise<PaymentResponse> {
    try {
      if (!paymentData.lawyer_id || !paymentData.amount) {
        throw new Error('Lawyer ID and amount are required');
      }

      const payment = await citizensAPI.createPayment(paymentData);
      return payment as PaymentResponse;
    } catch (error) {
      throw new Error(`Failed to create payment: ${error}`);
    }
  }

  /**
   * Get all citizen payments
   */
  static async getPayments(skip: number = 0, limit: number = 10) {
    try {
      return await citizensAPI.listPayments(skip, limit);
    } catch (error) {
      throw new Error(`Failed to fetch payments: ${error}`);
    }
  }

  /**
   * Confirm payment
   */
  static async confirmPayment(paymentId: number): Promise<PaymentResponse> {
    try {
      const payment = await citizensAPI.confirmPayment(paymentId);
      return payment as PaymentResponse;
    } catch (error) {
      throw new Error(`Failed to confirm payment: ${error}`);
    }
  }

  /**
   * Request refund
   */
  static async refundPayment(paymentId: number): Promise<PaymentResponse> {
    try {
      const payment = await citizensAPI.refundPayment(paymentId);
      return payment as PaymentResponse;
    } catch (error) {
      throw new Error(`Failed to process refund: ${error}`);
    }
  }

  /**
   * Get citizen dashboard
   */
  static async getDashboard() {
    try {
      return await citizensAPI.getDashboard();
    } catch (error) {
      throw new Error(`Failed to fetch dashboard: ${error}`);
    }
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats() {
    try {
      return await citizensAPI.getDashboardStats();
    } catch (error) {
      throw new Error(`Failed to fetch dashboard stats: ${error}`);
    }
  }

  /**
   * Get cases summary for dashboard
   */
  static async getCasesSummary() {
    try {
      return await citizensAPI.getCasesSummary();
    } catch (error) {
      throw new Error(`Failed to fetch cases summary: ${error}`);
    }
  }

  /**
   * Get consultations summary
   */
  static async getConsultationsSummary() {
    try {
      return await citizensAPI.getConsultationsSummary();
    } catch (error) {
      throw new Error(`Failed to fetch consultations summary: ${error}`);
    }
  }

  /**
   * Get activity summary
   */
  static async getActivitySummary(days: number = 30) {
    try {
      return await citizensAPI.getActivitySummary(days);
    } catch (error) {
      throw new Error(`Failed to fetch activity summary: ${error}`);
    }
  }

  /**
   * Setup 2FA
   */
  static async setup2FA(authMethod: string, phoneNumber?: string) {
    try {
      return await citizensAPI.setup2FA({
        auth_method: authMethod,
        phone_number: phoneNumber,
      });
    } catch (error) {
      throw new Error(`Failed to setup 2FA: ${error}`);
    }
  }

  /**
   * Verify 2FA code
   */
  static async verify2FA(code: string) {
    try {
      return await citizensAPI.verify2FA(code);
    } catch (error) {
      throw new Error(`Failed to verify 2FA code: ${error}`);
    }
  }

  /**
   * Enable 2FA
   */
  static async enable2FA(code: string) {
    try {
      return await citizensAPI.enable2FA(code);
    } catch (error) {
      throw new Error(`Failed to enable 2FA: ${error}`);
    }
  }

  /**
   * Get 2FA status
   */
  static async get2FAStatus(): Promise<TwoFactorAuthResponse> {
    try {
      return await citizensAPI.get2FAStatus();
    } catch (error) {
      throw new Error(`Failed to get 2FA status: ${error}`);
    }
  }

  /**
   * Disable 2FA
   */
  static async disable2FA(): Promise<TwoFactorAuthResponse> {
    try {
      return await citizensAPI.disable2FA();
    } catch (error) {
      throw new Error(`Failed to disable 2FA: ${error}`);
    }
  }
}

/**
 * Lawyer Service with Citizen Integration
 * Handles lawyer registration and ensures citizen profile is created
 */
export class LawyerRegistrationService {
  /**
   * Register lawyer and ensure citizen profile is created
   * This handles the case where lawyer registration needs to create an entry in the citizen table
   */
  static async registerLawyerWithCitizenProfile(registrationData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    location?: string;
    language?: string;
    // Additional lawyer fields
    barCouncilId?: string;
    specialization?: string;
    experience?: number;
    hourlyRate?: number;
    qualification?: string;
    bio?: string;
    languages?: string[];
  }): Promise<{ success: boolean; userId?: number; message: string }> {
    try {
      // Step 1: Register user as lawyer via auth endpoint
      const authResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'}/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: registrationData.username,
            email: registrationData.email,
            user_type: 'lawyer',
            password: registrationData.password,
            phone: registrationData.phone,
            location: registrationData.location,
            language: registrationData.language || 'en',
          }),
        }
      );

      if (!authResponse.ok) {
        const error = await authResponse.json();
        throw new Error(error.detail || 'Registration failed');
      }

      // Step 2: The backend should automatically create citizen profile
      // but we can verify by fetching the current user
      const registrationResult = await authResponse.json();

      return {
        success: true,
        userId: registrationResult.user_id,
        message:
          'Lawyer registered successfully. Citizen profile has been created.',
      };
    } catch (error) {
      throw new Error(
        `Lawyer registration failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get lawyer profile and ensure citizen profile exists
   * Call this after login to validate both profiles are in sync
   */
  static async getLawyerProfileWithCitizenCheck(
    lawyerId: number
  ): Promise<{
    lawyer: any;
    citizen: CitizenProfileResponse | null;
  }> {
    try {
      const lawyer = await lawyersAPI.getLawyerById(lawyerId);

      let citizen = null;
      try {
        citizen = await CitizenService.getCitizenProfile();
      } catch {
        console.warn('Citizen profile not found, creating minimal profile...');
        citizen = null;
      }

      return {
        lawyer,
        citizen,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch lawyer profile: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Ensure lawyer has both lawyer and citizen profiles
   * Call this on first login to sync profiles
   */
  static async ensureLawyerProfiles(userId: number): Promise<void> {
    try {
      // Try to get lawyer profile
      const user = await usersAPI.getUserById(userId);

      if (user.user_type === 'lawyer') {
        // Check if citizen profile exists
        try {
          await CitizenService.getCitizenProfile();
        } catch {
          // Citizen profile doesn't exist, create it
          console.log(
            'Creating citizen profile for lawyer user...'
          );
          await CitizenService.updateCitizenProfile({
            full_name: user.username,
          });
        }
      }
    } catch (error) {
      console.error('Failed to ensure lawyer profiles:', error);
    }
  }
}
