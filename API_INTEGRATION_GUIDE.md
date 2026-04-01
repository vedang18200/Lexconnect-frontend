# Backend API Integration Guide

This document describes how to use the Lexconnect backend API integration layer in the frontend.

## Configuration

**Base URL:** `http://localhost:8000/api/v1`

The API client automatically handles:
- Authorization tokens (stored in `localStorage.authToken`)
- Request/response serialization
- Error handling

## Authentication

### Login
```typescript
import { authAPI, setAuthToken } from '@/services/api';

try {
  const response = await authAPI.login('user@example.com', 'password');
  // response contains { access_token, refresh_token, token_type }
  setAuthToken(response.access_token);
  localStorage.setItem('refreshToken', response.refresh_token);
} catch (error) {
  console.error('Login failed:', error);
}
```

### Register
```typescript
const response = await authAPI.register({
  username: 'johndoe',
  email: 'john@example.com',
  user_type: 'citizen', // 'citizen' | 'lawyer' | 'social-worker'
  password: 'securepassword',
  phone: '+91-XXXXX-XXXXX',
  location: 'Delhi',
  language: 'en'
});
```

### Refresh Token
```typescript
const response = await authAPI.refresh(refreshToken);
setAuthToken(response.access_token);
```

## API Endpoints by Category

### Users API

Get current user:
```typescript
const user = await usersAPI.getCurrentUser();
```

Update current user:
```typescript
await usersAPI.updateCurrentUser({
  email: 'newemail@example.com',
  phone: '+91-XXXXX-XXXXX',
  location: 'Mumbai',
  language: 'hi'
});
```

Get user by ID:
```typescript
const user = await usersAPI.getUserById(userId);
```

List all users:
```typescript
const users = await usersAPI.getUsers(skip, limit);
```

Get lawyers list:
```typescript
const lawyers = await usersAPI.getLawyers(skip, limit);
```

---

### Lawyers API

#### Basic Operations
```typescript
// Create lawyer profile
const lawyer = await lawyersAPI.createLawyer({
  name: 'Adv. John Smith',
  email: 'john@example.com',
  phone: '+91-XXXXX-XXXXX',
  specialization: 'Criminal Law',
  experience: 10,
  location: 'Delhi',
  bio: 'Expert in criminal law with 10 years experience',
  fee_range: '5000-15000',
  languages: 'English, Hindi',
  user_id: 1
});

// Get all lawyers
const lawyers = await lawyersAPI.getLawyers(0, 10);

// Get specific lawyer
const lawyer = await lawyersAPI.getLawyerById(lawyerId);

// Update lawyer
await lawyersAPI.updateLawyer(lawyerId, {
  specialization: 'Civil Law',
  bio: 'Updated bio',
  fee_range: '6000-20000'
});

// Get user's lawyer profile
const lawyer = await lawyersAPI.getUserLawyer(userId);
```

#### Search & Filter
```typescript
// Search lawyers with filters
const results = await lawyersAPI.searchLawyers({
  query: 'john',
  specialization: 'Criminal Law',
  location: 'Delhi',
  min_rating: 4,
  max_fee: 15000,
  verified_only: true,
  skip: 0,
  limit: 10
});

// Get by specialization
const lawyers = await lawyersAPI.getLawyersBySpecialization('Criminal Law', 0, 10);

// Get by location
const lawyers = await lawyersAPI.getLawyersByLocation('Delhi', 0, 10);

// Get top rated
const topLawyers = await lawyersAPI.getTopRatedLawyers(10);

// Get verified lawyers
const verified = await lawyersAPI.getVerifiedLawyers(0, 10);

// Get detailed profile with reviews
const details = await lawyersAPI.getLawyerDetails(lawyerId);
```

#### Professional Credentials
```typescript
// Get credentials
const creds = await lawyersAPI.getCredentials();

// Update credentials
await lawyersAPI.updateCredentials({
  license_number: 'ABC123456',
  license_state: 'Delhi',
  bar_association: 'Delhi Bar Council',
  bar_admission_year: 2010,
  qualifications: 'LLB, LLM',
  court_admissions: 'Supreme Court, High Court'
});
```

#### Availability Management
```typescript
// Get all availability slots
const slots = await lawyersAPI.getAllAvailability();

// Create new availability
await lawyersAPI.createAvailability({
  day_of_week: 1, // Monday
  start_time: '09:00',
  end_time: '17:00',
  is_available: true,
  slot_duration_minutes: 60,
  break_start: '13:00',
  break_end: '14:00'
});

// Get availability for specific day
const daySlots = await lawyersAPI.getAvailabilityByDay(1); // Monday

// Update availability
await lawyersAPI.updateAvailability(availabilityId, {
  end_time: '18:00'
});

// Delete availability
await lawyersAPI.deleteAvailability(availabilityId);
```

#### Invoices & Billing
```typescript
// Create invoice
const invoice = await lawyersAPI.createInvoice({
  amount: 5000,
  tax_percentage: 18,
  tax_amount: 900,
  total_amount: 5900,
  description: 'Consultation services',
  due_date: '2024-03-30T00:00:00Z',
  notes: 'Payment terms: Net 30',
  citizen_id: 1,
  case_id: 1
});

// List invoices
const invoices = await lawyersAPI.listInvoices(0, 10, 'pending');

// Get specific invoice
const invoice = await lawyersAPI.getInvoice(invoiceId);

// Issue invoice
await lawyersAPI.issueInvoice(invoiceId);

// Mark as paid
await lawyersAPI.markInvoicePaid(invoiceId);
```

#### Dashboard
```typescript
// Get full dashboard
const dashboard = await lawyersAPI.getDashboard();

// Get dashboard statistics
const stats = await lawyersAPI.getDashboardStats();

// Get cases summary
const casesSummary = await lawyersAPI.getCasesSummary();

// Get earnings summary
const earnings = await lawyersAPI.getEarningsSummary();

// Get clients analytics
const analytics = await lawyersAPI.getClientsAnalytics();

// Get consultations analytics
const consultAnalytics = await lawyersAPI.getConsultationsAnalytics();

// Get activity summary (last 30 days)
const activity = await lawyersAPI.getActivitySummary(30);

// Get performance metrics
const performance = await lawyersAPI.getPerformanceMetrics();
```

#### Document Templates
```typescript
// Create template
const template = await lawyersAPI.createTemplate({
  name: 'Case Agreement',
  description: 'Standard agreement template',
  template_type: 'agreement',
  content: '<html>...</html>',
  is_public: false,
  category: 'legal',
  tags: 'agreement,case'
});

// List templates
const templates = await lawyersAPI.listTemplates(0, 10, 'agreement');

// Get template
const template = await lawyersAPI.getTemplate(templateId);

// Update template
await lawyersAPI.updateTemplate(templateId, { content: '<html>...</html>' });

// Delete template
await lawyersAPI.deleteTemplate(templateId);
```

#### Case Notes
```typescript
// Create case note
const note = await lawyersAPI.createCaseNote({
  note_type: 'follow-up',
  title: 'Client follow-up needed',
  content: 'Need to contact client about next hearing',
  is_private: false,
  priority: 'high',
  due_date: '2024-03-25T10:00:00Z',
  case_id: 1
});

// Get case notes
const notes = await lawyersAPI.getCaseNotes(caseId, 0, 10);

// Get specific note
const note = await lawyersAPI.getCaseNote(noteId);

// Update note
await lawyersAPI.updateCaseNote(noteId, { content: 'Updated content' });

// Delete note
await lawyersAPI.deleteCaseNote(noteId);

// Mark as complete
await lawyersAPI.markNoteComplete(noteId);

// Get pending notes
const pending = await lawyersAPI.getPendingNotes();
```

---

### Cases API

```typescript
// Create case
const case_ = await casesAPI.createCase({
  title: 'Property Dispute',
  description: 'Dispute over property ownership',
  category: 'Property Law',
  priority: 'high',
  case_number: 'CASE-2024-001',
  user_id: 1,
  lawyer_id: 2
});

// Get all cases
const cases = await casesAPI.getCases(0, 10);

// Get specific case
const case_ = await casesAPI.getCaseById(caseId);

// Update case
await casesAPI.updateCase(caseId, {
  status: 'in_progress',
  priority: 'medium'
});

// Get user's cases
const cases = await casesAPI.getUserCases(userId, 0, 10);

// Get lawyer's cases
const cases = await casesAPI.getLawyerCases(lawyerId, 0, 10);
```

---

### Consultations API

```typescript
// Create consultation
const consultation = await consultationsAPI.createConsultation({
  consultation_type: 'initial',
  duration_minutes: 60,
  fee_amount: 500,
  notes: 'Initial consultation',
  user_id: 1,
  lawyer_id: 2,
  scheduled_at: '2024-03-25T14:00:00Z'
});

// Get all consultations
const consultations = await consultationsAPI.getConsultations(0, 10);

// Get specific consultation
const consultation = await consultationsAPI.getConsultationById(consultationId);

// Update consultation
await consultationsAPI.updateConsultation(consultationId, {
  status: 'completed',
  consultation_date: '2024-03-25T14:00:00Z'
});

// Get user's consultations
const consultations = await consultationsAPI.getUserConsultations(userId, 0, 10);

// Get lawyer's consultations
const consultations = await consultationsAPI.getLawyerConsultations(lawyerId, 0, 10);
```

---

### Messages API

```typescript
// Send direct message
const message = await messagesAPI.sendMessage(receiverId, 'Hello, how are you?');

// Get conversations
const messages = await messagesAPI.getMessages(otherUserId, 0, 10);

// Mark message as read
await messagesAPI.markMessageRead(messageId);

// Chat with AI
const response = await messagesAPI.createChatMessage('What is the legal process for property registration?', 'en');

// Get chat history
const history = await messagesAPI.getChatHistory(0, 10);
```

---

### Citizens API

#### Profile
```typescript
// Get profile
const profile = await citizensAPI.getProfile();

// Update profile
await citizensAPI.updateProfile({
  full_name: 'Priya Sharma',
  date_of_birth: '1990-01-15T00:00:00Z',
  gender: 'Female',
  address: '123 Main St, Apt 4B',
  city: 'Delhi',
  state: 'Delhi',
  pincode: '110001',
  bio: 'Need legal assistance',
  profile_picture_url: 'https://...'
});
```

#### 2FA (Two-Factor Authentication)
```typescript
// Setup 2FA
await citizensAPI.setup2FA({
  auth_method: 'totp',
  phone_number: null
});

// Get QR code
const qrCode = await citizensAPI.getQRCode();

// Verify 2FA code
await citizensAPI.verify2FA('123456');

// Enable 2FA
await citizensAPI.enable2FA('123456');

// Get 2FA status
const status = await citizensAPI.get2FAStatus();

// Disable 2FA
await citizensAPI.disable2FA();

// Regenerate backup codes
await citizensAPI.regenerateBackupCodes();
```

#### Documents
```typescript
// Upload document
const response = await citizensAPI.uploadDocument(
  file,
  caseId,
  'contract',
  'Property sale agreement'
);

// List documents
const documents = await citizensAPI.listDocuments(caseId, 0, 10);

// Get document
const document = await citizensAPI.getDocument(documentId);

// Delete document
await citizensAPI.deleteDocument(documentId);
```

#### Reviews
```typescript
// Create review
const review = await citizensAPI.createReview({
  rating: 5,
  title: 'Excellent service',
  review_text: 'Very professional and helpful',
  communication_rating: 5,
  professionalism_rating: 5,
  effectiveness_rating: 5,
  lawyer_id: 2,
  case_id: 1
});

// Get my reviews
const myReviews = await citizensAPI.getMyReviews(0, 10);

// Get specific review
const review = await citizensAPI.getReview(reviewId);

// Update review
await citizensAPI.updateReview(reviewId, { rating: 4 });

// Delete review
await citizensAPI.deleteReview(reviewId);

// Mark helpful
await citizensAPI.markReviewHelpful(reviewId);

// Mark unhelpful
await citizensAPI.markReviewUnhelpful(reviewId);
```

#### Payments
```typescript
// Create payment
const payment = await citizensAPI.createPayment({
  amount: 5000,
  payment_method: 'credit_card',
  description: 'Consultation fee',
  lawyer_id: 2,
  consultation_id: 1
});

// List payments
const payments = await citizensAPI.listPayments(0, 10);

// Get payment
const payment = await citizensAPI.getPayment(paymentId);

// Confirm payment
await citizensAPI.confirmPayment(paymentId);

// Request refund
await citizensAPI.refundPayment(paymentId);
```

#### Dashboard
```typescript
// Get dashboard
const dashboard = await citizensAPI.getDashboard();

// Get stats
const stats = await citizensAPI.getDashboardStats();

// Get cases summary
const cases = await citizensAPI.getCasesSummary();

// Get consultations summary
const consultations = await citizensAPI.getConsultationsSummary();

// Get activity (last 30 days)
const activity = await citizensAPI.getActivitySummary(30);
```

---

### Social Workers API

#### Profile
```typescript
// Get profile
const profile = await socialWorkersAPI.getProfile();

// Update profile
await socialWorkersAPI.updateProfile({
  license_number: 'SW123456',
  specialization: 'Child Welfare',
  bio: 'Experienced social worker'
});

// Create or get profile
const profile = await socialWorkersAPI.createOrGetProfile({
  agency_id: 1,
  license_number: 'SW123456',
  specialization: 'Child Welfare',
  bio: 'Experienced social worker'
});
```

#### Referrals
```typescript
// Create referral
const referral = await socialWorkersAPI.createReferral({
  lawyer_id: 2,
  citizen_id: 1,
  referral_reason: 'Client needs criminal law assistance',
  case_category: 'Criminal Law'
});

// List referrals
const referrals = await socialWorkersAPI.listReferrals(0, 10, 'pending');

// Get specific referral
const referral = await socialWorkersAPI.getReferral(referralId);

// Update referral
await socialWorkersAPI.updateReferral(referralId, {
  status: 'accepted',
  outcome: 'Case opened',
  outcome_notes: 'Initial consultation completed'
});

// Get referred cases
const cases = await socialWorkersAPI.getReferredCases(0, 10);

// Get referrals for specific lawyer
const referrals = await socialWorkersAPI.getLawyerReferrals(lawyerId, 0, 10);

// Get referrals for specific client
const referrals = await socialWorkersAPI.getClientReferredCases(citizenId, 0, 10);

// Get approved lawyers
const lawyers = await socialWorkersAPI.getApprovedLawyers('Criminal Law', 0, 10);
```

#### Dashboard
```typescript
// Get dashboard
const dashboard = await socialWorkersAPI.getDashboard();

// Get stats
const stats = await socialWorkersAPI.getDashboardStats();

// Get impact report (last 30 days)
const report = await socialWorkersAPI.getImpactReport(30);

// Get agency dashboard
const agencyDash = await socialWorkersAPI.getAgencyDashboard(agencyId);

// Get agency stats
const agencyStats = await socialWorkersAPI.getAgencyStats(agencyId);

// Get agency workers
const workers = await socialWorkersAPI.getAgencyWorkers(agencyId, 0, 10);
```

#### Messages
```typescript
// Send coordination message
await socialWorkersAPI.sendCoordinationMessage(recipientId, 'Need your assistance with a case');

// Get coordination messages
const messages = await socialWorkersAPI.getCoordinationMessages(otherUserId, 0, 10);
```

---

## Error Handling

```typescript
import { usersAPI } from '@/services/api';

try {
  const user = await usersAPI.getCurrentUser();
} catch (error) {
  if (error instanceof Error) {
    console.error('API Error:', error.message);
    // Handle error appropriately
  }
}
```

## TypeScript Types

All API responses are typed. Import from `@/services/types`:

```typescript
import type {
  UserResponse,
  LawyerResponse,
  CaseResponse,
  ConsultationResponse,
  // ... and many more
} from '@/services/types';

const user: UserResponse = await usersAPI.getCurrentUser();
```

## Token Management

Authentication tokens are automatically managed:

```typescript
import { setAuthToken, clearAuthToken, hasAuthToken, getAuthToken } from '@/services/api';

// Set token after login
setAuthToken(accessToken);

// Check if authenticated
if (hasAuthToken()) {
  // User is logged in
}

// Clear on logout
clearAuthToken();
```

---

## Environment Variables

Create a `.env` file if you need to override the base URL:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Then update `src/app/services/api.ts` to use:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
```

---

## Examples

### Complete Login Flow
```typescript
import { authAPI, setAuthToken } from '@/services/api';
import { usersAPI } from '@/services/api';

const handleLogin = async (username: string, password: string) => {
  try {
    // Login
    const tokenResponse = await authAPI.login(username, password);
    setAuthToken(tokenResponse.access_token);

    // Get user details
    const user = await usersAPI.getCurrentUser();

    // Navigate based on user type
    if (user.user_type === 'lawyer') {
      navigate('/lawyer-dashboard');
    } else if (user.user_type === 'social-worker') {
      navigate('/social-worker-dashboard');
    } else {
      navigate('/');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Fetch Lawyer Details
```typescript
import { lawyersAPI } from '@/services/api';
import type { LawyerResponse } from '@/services/types';

const fetchLawyerDetails = async (lawyerId: number) => {
  try {
    const lawyer: LawyerResponse = await lawyersAPI.getLawyerById(lawyerId);
    const details = await lawyersAPI.getLawyerDetails(lawyerId);

    return { lawyer, details };
  } catch (error) {
    console.error('Failed to fetch lawyer:', error);
  }
};
```

### Create Case with Consultation
```typescript
import { casesAPI, consultationsAPI } from '@/services/api';

const createCaseWithConsultation = async (
  caseData: any,
  consultationData: any
) => {
  try {
    // Create case
    const case_ = await casesAPI.createCase(caseData);

    // Create consultation
    const consultation = await consultationsAPI.createConsultation({
      ...consultationData,
      user_id: caseData.user_id,
      lawyer_id: caseData.lawyer_id
    });

    return { case: case_, consultation };
  } catch (error) {
    console.error('Failed to create case:', error);
  }
};
```

---

## Troubleshooting

### 401 Unauthorized
- Token has expired: Use refresh token to get new access token
- Token is missing: Ensure `setAuthToken()` was called after login
- Backend is down: Check if server is running on port 8000

### 422 Validation Error
- Invalid request payload: Check API schema definitions
- Missing required fields: Refer to type definitions

### Network Error
- Check CORS configuration on backend
- Verify backend URL is correct
- Check browser console for detailed error

---

For more information about the backend API, refer to the OpenAPI documentation at `http://localhost:8000/docs`
