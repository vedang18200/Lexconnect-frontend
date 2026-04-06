import type { UserResponse, TwoFactorAuthResponse } from './types';
import type { ConsultationDetailResponse } from './types/citizenConsultations';

// API Configuration and base client
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

const PUBLIC_AUTH_ENDPOINTS = new Set([
  '/auth/login',
  '/auth/login/citizen',
  '/auth/login/lawyer',
  '/auth/login/social-worker',
  '/auth/register',
]);

const isPublicAuthEndpoint = (endpoint: string) => {
  return PUBLIC_AUTH_ENDPOINTS.has(endpoint);
};

// Get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Make HTTP requests with auth token
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    console.debug(`[API] Sending request with auth token to ${endpoint}`);
  } else {
    if (isPublicAuthEndpoint(endpoint)) {
      console.debug(`[API] Public auth request without token for ${endpoint}`);
    } else {
      console.warn(`[API] No auth token found for ${endpoint}`);
    }
  }

  headers.set('Content-Type', 'application/json');

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({} as Record<string, unknown>));
    const errorMessage =
      (typeof errorBody.message === 'string' && errorBody.message) ||
      (typeof errorBody.detail === 'string' && errorBody.detail) ||
      `API Error: ${response.status}`;

    // Handle 401 Unauthorized - clear stored auth and redirect to login
    if (response.status === 401) {
      try {
        console.error(`[API] 401 Unauthorized on ${endpoint}`, {
          url: url,
          endpoint: endpoint,
          authTokenSent: !!token,
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
          responseBody: errorBody,
          headers: Object.fromEntries(response.headers.entries()),
        });
      } catch (e) {
        console.error(`[API] 401 Unauthorized on ${endpoint} - cannot parse error body`);
      }

      if (isPublicAuthEndpoint(endpoint)) {
        // Login/registration failures are expected auth errors, not expired sessions.
        throw new Error(errorMessage);
      }

      clearAuthToken();
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
      localStorage.removeItem('username');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('createdAt');
      // Redirect to login page
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

// ============================================
// AUTH ENDPOINTS
// ============================================
export const authAPI = {
  // Generic login (fallback, deprecated in favor of role-specific)
  login: (username: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // Role-specific login endpoints
  loginAsCitizen: (username: string, password: string) =>
    request('/auth/login/citizen', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  loginAsLawyer: (username: string, password: string) =>
    request('/auth/login/lawyer', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  loginAsSocialWorker: (username: string, password: string) =>
    request('/auth/login/social-worker', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (data: {
    username: string;
    email: string;
    user_type: 'citizen' | 'lawyer' | 'social-worker';
    password: string;
    phone?: string;
    location?: string;
    language?: string;
  }) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refresh: (refreshToken: string) =>
    request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),
};

// ============================================
// USER ENDPOINTS
// ============================================
export const usersAPI = {
  getCurrentUser: () => request('/users/me'),

  updateCurrentUser: (data: {
    email?: string;
    phone?: string;
    location?: string;
    language?: string;
  }) =>
    request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getUserById: (userId: number) => request<UserResponse>(`/users/${userId}`),

  getUsers: (skip: number = 0, limit: number = 10) =>
    request(`/users?skip=${skip}&limit=${limit}`),

  getLawyers: (skip: number = 0, limit: number = 10) =>
    request(`/users/list/lawyers?skip=${skip}&limit=${limit}`),
};

// ============================================
// LAWYERS ENDPOINTS
// ============================================
export const lawyersAPI = {
  // Basic lawyer operations
  createLawyer: (data: any) =>
    request('/lawyers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getLawyers: (skip: number = 0, limit: number = 10) =>
    request(`/lawyers?skip=${skip}&limit=${limit}`),

  getLawyerById: (lawyerId: number) => request(`/lawyers/${lawyerId}`),

  updateLawyer: (lawyerId: number, data: any) =>
    request(`/lawyers/${lawyerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Search and filter
  searchLawyers: (params: {
    query?: string;
    specialization?: string;
    location?: string;
    min_rating?: number;
    max_fee?: number;
    verified_only?: boolean;
    skip?: number;
    limit?: number;
  }) => {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return request(`/lawyers/search?${queryString}`);
  },

  getLawyersBySpecialization: (
    specialization: string,
    skip: number = 0,
    limit: number = 10
  ) =>
    request(
      `/lawyers/specialization/${specialization}?skip=${skip}&limit=${limit}`
    ),

  getLawyersByLocation: (
    location: string,
    skip: number = 0,
    limit: number = 10
  ) =>
    request(`/lawyers/location/${location}?skip=${skip}&limit=${limit}`),

  getTopRatedLawyers: (limit: number = 10) =>
    request(`/lawyers/top-rated?skip=0&limit=${limit}`),

  getVerifiedLawyers: (skip: number = 0, limit: number = 10) =>
    request(`/lawyers/verified/list?skip=${skip}&limit=${limit}`),

  getLawyerDetails: (lawyerId: number) =>
    request(`/lawyers/${lawyerId}/details`),

  // Find lawyers for public listing/search
  findLawyers: (params: {
    query?: string;
    specialization?: string;
    min_price?: number;
    max_price?: number;
    location?: string;
    min_rating?: number;
    verified_only?: boolean;
    skip?: number;
    limit?: number;
  }) => {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return request(`/find-lawyers?${queryString}`);
  },

  // Get single lawyer card with all details
  getLawyerCard: (lawyerId: number) =>
    request(`/lawyers/${lawyerId}/card`),

  // Get detailed lawyer profile for View Full Profile modal/page
  getLawyerProfile: (lawyerId: number) =>
    request(`/lawyers/${lawyerId}/profile`),

  getUserLawyer: (userId: number) => request(`/users/${userId}/lawyer`),

  // Professional endpoints
  getCredentials: () => request('/lawyers/professional/credentials'),

  updateCredentials: (data: any) =>
    request('/lawyers/professional/credentials', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Availability
  getAllAvailability: () =>
    request('/lawyers/professional/availability'),

  createAvailability: (data: any) =>
    request('/lawyers/professional/availability', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAvailabilityByDay: (dayOfWeek: number) =>
    request(`/lawyers/professional/availability/day/${dayOfWeek}`),

  updateAvailability: (availabilityId: number, data: any) =>
    request(`/lawyers/professional/availability/${availabilityId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAvailability: (availabilityId: number) =>
    request(`/lawyers/professional/availability/${availabilityId}`, {
      method: 'DELETE',
    }),

  // Invoices
  createInvoice: (data: any) =>
    request('/lawyers/professional/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listInvoices: (skip: number = 0, limit: number = 10, status?: string) =>
    request(
      `/lawyers/professional/invoices?skip=${skip}&limit=${limit}${status ? `&status=${status}` : ''}`
    ),

  getInvoice: (invoiceId: number) =>
    request(`/lawyers/professional/invoices/${invoiceId}`),

  issueInvoice: (invoiceId: number) =>
    request(`/lawyers/professional/invoices/${invoiceId}/issue`, {
      method: 'POST',
    }),

  markInvoicePaid: (invoiceId: number) =>
    request(`/lawyers/professional/invoices/${invoiceId}/mark-paid`, {
      method: 'POST',
    }),

  // Dashboard
  getDashboard: () => request('/lawyers/professional/dashboard'),
  getDashboardStats: () => request('/lawyers/professional/dashboard/stats'),
  getCasesSummary: () =>
    request('/lawyers/professional/dashboard/cases-summary'),
  getEarningsSummary: () =>
    request('/lawyers/professional/dashboard/earnings-summary'),
  getClientsAnalytics: () =>
    request('/lawyers/professional/dashboard/clients-analytics'),
  getConsultationsAnalytics: () =>
    request('/lawyers/professional/dashboard/consultations-analytics'),
  getActivitySummary: (days: number = 30) =>
    request(`/lawyers/professional/dashboard/activity?days=${days}`),
  getPerformanceMetrics: () =>
    request('/lawyers/professional/dashboard/performance'),

  // Templates
  createTemplate: (data: any) =>
    request('/lawyers/professional/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listTemplates: (skip: number = 0, limit: number = 10, templateType?: string) =>
    request(
      `/lawyers/professional/templates?skip=${skip}&limit=${limit}${templateType ? `&template_type=${templateType}` : ''}`
    ),

  getTemplate: (templateId: number) =>
    request(`/lawyers/professional/templates/${templateId}`),

  updateTemplate: (templateId: number, data: any) =>
    request(`/lawyers/professional/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTemplate: (templateId: number) =>
    request(`/lawyers/professional/templates/${templateId}`, {
      method: 'DELETE',
    }),

  // Case Notes
  createCaseNote: (data: any) =>
    request('/lawyers/professional/case-notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCaseNotes: (caseId: number, skip: number = 0, limit: number = 10) =>
    request(
      `/lawyers/professional/case-notes/case/${caseId}?skip=${skip}&limit=${limit}`
    ),

  getCaseNote: (noteId: number) =>
    request(`/lawyers/professional/case-notes/${noteId}`),

  updateCaseNote: (noteId: number, data: any) =>
    request(`/lawyers/professional/case-notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCaseNote: (noteId: number) =>
    request(`/lawyers/professional/case-notes/${noteId}`, {
      method: 'DELETE',
    }),

  markNoteComplete: (noteId: number) =>
    request(`/lawyers/professional/case-notes/${noteId}/complete`, {
      method: 'POST',
    }),

  getPendingNotes: () => request('/lawyers/professional/case-notes/pending'),
};

// ============================================
// CASES ENDPOINTS
// ============================================
export const casesAPI = {
  createCase: (data: any) =>
    request('/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCases: (skip: number = 0, limit: number = 10) =>
    request(`/cases?skip=${skip}&limit=${limit}`),

  getCaseById: (caseId: number) => request(`/cases/${caseId}`),

  updateCase: (caseId: number, data: any) =>
    request(`/cases/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getUserCases: (userId: number, skip: number = 0, limit: number = 10) =>
    request(`/users/${userId}/cases?skip=${skip}&limit=${limit}`),

  getLawyerCases: (lawyerId: number, skip: number = 0, limit: number = 10) =>
    request(`/lawyers/${lawyerId}/cases?skip=${skip}&limit=${limit}`),
};

// ============================================
// CONSULTATIONS ENDPOINTS
// ============================================
export const consultationsAPI = {
  createConsultation: (data: any) =>
    request('/consultations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getConsultations: (skip: number = 0, limit: number = 10) =>
    request(`/consultations?skip=${skip}&limit=${limit}`),

  getConsultationById: (consultationId: number) =>
    request(`/consultations/${consultationId}`),

  updateConsultation: (consultationId: number, data: any) =>
    request(`/consultations/${consultationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getUserConsultations: (userId: number, skip: number = 0, limit: number = 10) =>
    request(`/users/${userId}/consultations?skip=${skip}&limit=${limit}`),

  getLawyerConsultations: (
    lawyerId: number,
    skip: number = 0,
    limit: number = 10
  ) =>
    request(`/lawyers/${lawyerId}/consultations?skip=${skip}&limit=${limit}`),
};

// ============================================
// MESSAGES ENDPOINTS
// ============================================
export const messagesAPI = {
  // Conversations
  getConversations: () =>
    request('/messages/conversations'),

  // Direct messages
  sendMessage: (receiverId: number, message: string) =>
    request('/messages/direct', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId, message }),
    }),

  getMessages: (otherUserId: number, skip: number = 0, limit: number = 10) =>
    request(`/messages/direct/${otherUserId}?skip=${skip}&limit=${limit}`),

  markMessageRead: (messageId: number) =>
    request(`/messages/${messageId}/read`, {
      method: 'PUT',
    }),

  // Chat with AI
  createChatMessage: (message: string, language: string = 'en') =>
    request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, language }),
    }),

  getChatHistory: (skip: number = 0, limit: number = 10) =>
    request(`/chat/history?skip=${skip}&limit=${limit}`),
};

// ============================================
// CITIZENS ENDPOINTS
// ============================================
export const citizensAPI = {
  // Profile
  getProfile: () => request('/citizens/profile'),

  updateProfile: (data: any) =>
    request('/citizens/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 2FA
  setup2FA: (data: any) =>
    request('/citizens/2fa/setup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verify2FA: (code: string) =>
    request('/citizens/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  enable2FA: (code: string) =>
    request('/citizens/2fa/enable', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  disable2FA: () =>
    request<TwoFactorAuthResponse>('/citizens/2fa/disable', {
      method: 'POST',
    }),

  get2FAStatus: () => request<TwoFactorAuthResponse>('/citizens/2fa/status'),

  regenerateBackupCodes: () =>
    request('/citizens/2fa/backup-codes', {
      method: 'POST',
    }),

  getQRCode: () => request('/citizens/2fa/qr-code'),

  // Documents
  uploadDocument: (file: File, caseId?: number, documentType?: string, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);

    const url = new URL(`${API_BASE_URL}/citizens/documents`);
    if (caseId) url.searchParams.append('case_id', String(caseId));
    if (documentType) url.searchParams.append('document_type', documentType);
    if (description) url.searchParams.append('description', description);

    const headers = new Headers();
    const token = getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(url.toString(), {
      method: 'POST',
      headers,
      body: formData,
    }).then(res => res.json());
  },

  listDocuments: (caseId?: number, skip: number = 0, limit: number = 10) => {
    let endpoint = `/citizens/documents?skip=${skip}&limit=${limit}`;
    if (caseId) endpoint += `&case_id=${caseId}`;
    return request(endpoint);
  },

  getDocument: (documentId: number) =>
    request(`/citizens/documents/${documentId}`),

  deleteDocument: (documentId: number) =>
    request(`/citizens/documents/${documentId}`, {
      method: 'DELETE',
    }),

  // Reviews
  createReview: (data: any) =>
    request('/citizens/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyReviews: (skip: number = 0, limit: number = 10) =>
    request(`/citizens/reviews/my-reviews?skip=${skip}&limit=${limit}`),

  getReview: (reviewId: number) =>
    request(`/citizens/reviews/${reviewId}`),

  updateReview: (reviewId: number, data: any) =>
    request(`/citizens/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteReview: (reviewId: number) =>
    request(`/citizens/reviews/${reviewId}`, {
      method: 'DELETE',
    }),

  markReviewHelpful: (reviewId: number) =>
    request(`/citizens/reviews/${reviewId}/helpful`, {
      method: 'POST',
    }),

  markReviewUnhelpful: (reviewId: number) =>
    request(`/citizens/reviews/${reviewId}/unhelpful`, {
      method: 'POST',
    }),

  // Payments
  createPayment: (data: any) =>
    request('/citizens/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listPayments: (skip: number = 0, limit: number = 10) =>
    request(`/citizens/payments?skip=${skip}&limit=${limit}`),

  getPayment: (paymentId: number) =>
    request(`/citizens/payments/${paymentId}`),

  confirmPayment: (paymentId: number) =>
    request(`/citizens/payments/${paymentId}/confirm`, {
      method: 'POST',
    }),

  refundPayment: (paymentId: number) =>
    request(`/citizens/payments/${paymentId}/refund`, {
      method: 'POST',
    }),

  // Cases
  getCaseStatistics: () =>
    request('/cases/my-cases/statistics'),

  getMyCases: (filters: {
    status_filter?: string;
    priority_filter?: string;
    search?: string;
    skip?: number;
    limit?: number;
  } = {}) => {
    const params = new URLSearchParams();
    if (filters.status_filter) params.append('status_filter', filters.status_filter);
    if (filters.priority_filter) params.append('priority_filter', filters.priority_filter);
    if (filters.search) params.append('search', filters.search);
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());

    return request(`/cases/my-cases${params.toString() ? `?${params}` : ''}`);
  },

  // Dashboard
  getDashboard: () => request('/citizens/dashboard'),
  getDashboardStats: () => request('/citizens/dashboard/stats'),
  getCasesSummary: () => request('/citizens/dashboard/cases-summary'),
  getConsultationsSummary: (params: {
    status?: string;
    mode?: string;
    q?: string;
    skip?: number;
    limit?: number;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.mode && params.mode !== 'all') query.append('mode', params.mode);
    if (params.q) query.append('q', params.q);
    if (params.skip !== undefined) query.append('skip', String(params.skip));
    if (params.limit !== undefined) query.append('limit', String(params.limit));

    return request(`/citizens/dashboard/consultations-summary${query.toString() ? `?${query.toString()}` : ''}`);
  },
  getConsultationDetails: (consultationId: number) =>
    request<ConsultationDetailResponse>(`/citizens/dashboard/consultations/${consultationId}/details`),
  getActivitySummary: (days: number = 30) =>
    request(`/citizens/dashboard/activity?days=${days}`),
};

// ============================================
// SOCIAL WORKERS ENDPOINTS
// ============================================
export const socialWorkersAPI = {
  // Profile
  getProfile: () => request('/social-workers/profile'),

  updateProfile: (data: any) =>
    request('/social-workers/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  createOrGetProfile: (data: any) =>
    request('/social-workers/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Referrals
  createReferral: (data: any) =>
    request('/social-workers/referrals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listReferrals: (skip: number = 0, limit: number = 10, status?: string) =>
    request(
      `/social-workers/referrals?skip=${skip}&limit=${limit}${status ? `&status=${status}` : ''}`
    ),

  getReferral: (referralId: number) =>
    request(`/social-workers/referrals/${referralId}`),

  updateReferral: (referralId: number, data: any) =>
    request(`/social-workers/referrals/${referralId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getReferredCases: (skip: number = 0, limit: number = 10) =>
    request(`/social-workers/referred-cases?skip=${skip}&limit=${limit}`),

  getLawyerReferrals: (
    lawyerId: number,
    skip: number = 0,
    limit: number = 10
  ) =>
    request(
      `/social-workers/lawyer/${lawyerId}/referrals?skip=${skip}&limit=${limit}`
    ),

  getClientReferredCases: (
    citizenId: number,
    skip: number = 0,
    limit: number = 10
  ) =>
    request(
      `/social-workers/client/${citizenId}/referrals?skip=${skip}&limit=${limit}`
    ),

  getApprovedLawyers: (
    specialization?: string,
    skip: number = 0,
    limit: number = 10
  ) =>
    request(
      `/social-workers/lawyers/approved?skip=${skip}&limit=${limit}${specialization ? `&specialization=${specialization}` : ''}`
    ),

  // Dashboard
  getDashboard: () => request('/social-workers/dashboard'),
  getDashboardStats: () => request('/social-workers/dashboard/stats'),
  getImpactReport: (days: number = 30) =>
    request(`/social-workers/dashboard/impact-report?days=${days}`),

  // Agency
  getAgencyDashboard: (agencyId: number) =>
    request(`/social-workers/agency/${agencyId}/dashboard`),

  getAgencyStats: (agencyId: number) =>
    request(`/social-workers/agency/${agencyId}/stats`),

  getAgencyWorkers: (
    agencyId: number,
    skip: number = 0,
    limit: number = 10
  ) =>
    request(
      `/social-workers/agency/${agencyId}/workers?skip=${skip}&limit=${limit}`
    ),

  // Messages
  sendCoordinationMessage: (recipientId: number, messageContent: string) =>
    request(`/social-workers/messages/${recipientId}`, {
      method: 'POST',
      body: JSON.stringify({ message_content: messageContent }),
    }),

  getCoordinationMessages: (
    otherUserId: number,
    skip: number = 0,
    limit: number = 10
  ) =>
    request(
      `/social-workers/messages/${otherUserId}?skip=${skip}&limit=${limit}`
    ),
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
};

export const hasAuthToken = () => {
  return Boolean(getAuthToken());
};
