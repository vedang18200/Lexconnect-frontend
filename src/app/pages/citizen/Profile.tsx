import { useState, useEffect, type ChangeEvent } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import {
  Loader,
  Check,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  CircleCheck,
  Pencil,
  Eye,
  EyeOff,
  Shield,
  Lock,
  Monitor,
  Bell,
  FileText,
  Upload,
  Download,
} from "lucide-react";
import { citizensAPI, usersAPI } from "../../services/api";
import { useCitizenRouteGuard } from "../../hooks/useCitizenRouteGuard";
import type {
  BillingHistoryResponse,
  CitizenProfileResponse,
  NotificationPreferencesResponse,
  TwoFactorAuthResponse,
} from "../../services/types";

type ProfileTab =
  | "personal"
  | "security"
  | "notifications"
  | "documents"
  | "billing";

type ProfileFormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  occupation: string;
  aadhar_number: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

type ProfileStats = {
  total_cases: number;
  active_cases: number;
  total_spent: number;
};

type NotificationPreferences = {
  email_notifications: boolean;
  sms_notifications: boolean;
  case_updates: boolean;
  consultation_reminders: boolean;
  payment_alerts: boolean;
  marketing_emails: boolean;
};

type ProfileDocument = {
  id: string;
  file_name: string;
  document_type: string;
  file_size_label: string;
  uploaded_at_label: string;
  is_verified: boolean;
  file_url?: string;
};

type BillingHistoryItem = {
  id: string;
  title: string;
  date: string;
  payment_method: string;
  transaction_id: string;
  amount: number;
  status: "Completed";
};

const DEFAULT_FORM: ProfileFormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  gender: "",
  occupation: "",
  aadhar_number: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  email_notifications: true,
  sms_notifications: true,
  case_updates: true,
  consultation_reminders: true,
  payment_alerts: true,
  marketing_emails: false,
};

const splitName = (fullName?: string) => {
  const trimmed = fullName?.trim() ?? "";
  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatFileSize = (bytes?: number) => {
  const size = Number(bytes ?? 0);
  if (!size || Number.isNaN(size)) return "-";
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
};

const formatUploadedAtLabel = (value?: string) => {
  if (!value) return "Uploaded -";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Uploaded -";
  return `Uploaded ${date.toISOString().slice(0, 10)}`;
};

export function CitizenProfile() {
  // Protect route - only citizens can access
  const isAuthorized = useCitizenRouteGuard();

  const [profile, setProfile] = useState<CitizenProfileResponse | null>(null);
  const [formData, setFormData] = useState<ProfileFormState>(DEFAULT_FORM);
  const [formSnapshot, setFormSnapshot] = useState<ProfileFormState>(DEFAULT_FORM);
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    total_cases: 0,
    active_cases: 0,
    total_spent: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("personal");

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showSecurityField, setShowSecurityField] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorAuthResponse | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorSetupStarted, setTwoFactorSetupStarted] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorActionLoading, setTwoFactorActionLoading] = useState(false);
  const [notificationPrefs, setNotificationPrefs] =
    useState<NotificationPreferences>(DEFAULT_NOTIFICATIONS);
  const [notificationSaved, setNotificationSaved] = useState(false);
  const [documents, setDocuments] = useState<ProfileDocument[]>([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileData, caseStatsData, dashboardStatsData, notificationData, documentsData, billingData] = await Promise.allSettled([
        citizensAPI.getProfile(),
        citizensAPI.getCaseStatistics(),
        citizensAPI.getDashboardStats(),
        citizensAPI.getNotificationPreferences(),
        citizensAPI.listDocuments(undefined, 0, 50),
        citizensAPI.getBillingHistory({ skip: 0, limit: 50 }),
      ]);

      if (profileData.status !== "fulfilled") {
        throw profileData.reason;
      }

      const data = profileData.value as CitizenProfileResponse;
      setProfile(data);

      const { firstName, lastName } = splitName(data.full_name);

      const nextFormData: ProfileFormState = {
        first_name: firstName,
        last_name: lastName,
        email: data.email || "",
        phone: data.phone || "",
        date_of_birth: data.date_of_birth || "",
        gender: data.gender || "",
        occupation: data.occupation || data.bio || "",
        aadhar_number: data.aadhar_number_masked || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
      };

      setFormData(nextFormData);
      setFormSnapshot(nextFormData);

      if (notificationData.status === "fulfilled") {
        const prefs = notificationData.value as NotificationPreferencesResponse;
        setNotificationPrefs({
          email_notifications: Boolean(prefs.email_notifications),
          sms_notifications: Boolean(prefs.sms_notifications),
          case_updates: Boolean(prefs.case_updates),
          consultation_reminders: Boolean(prefs.consultation_reminders),
          payment_alerts: Boolean(prefs.payment_alerts),
          marketing_emails: Boolean(prefs.marketing_emails),
        });
      } else {
        setNotificationPrefs(DEFAULT_NOTIFICATIONS);
      }

      if (documentsData.status === "fulfilled") {
        const payload = documentsData.value as {
          documents?: Array<{
            id?: number;
            file_name?: string;
            document_type?: string;
            file_url?: string;
            file_size?: number;
            is_verified?: boolean;
            uploaded_at?: string;
          }>;
        };
        const nextDocuments = (payload.documents || []).map((doc) => ({
          id: `doc-${doc.id ?? Math.random()}`,
          file_name: doc.file_name || "Document",
          document_type: doc.document_type || "Document",
          file_size_label: formatFileSize(doc.file_size),
          uploaded_at_label: formatUploadedAtLabel(doc.uploaded_at),
          is_verified: Boolean(doc.is_verified),
          file_url: doc.file_url,
        }));
        setDocuments(nextDocuments);
      } else {
        setDocuments([]);
      }

      if (billingData.status === "fulfilled") {
        const billingPayload = billingData.value as BillingHistoryResponse;
        const items = (billingPayload.items || []).map((item) => ({
          id: `bill-${item.id}`,
          title: item.title,
          date: item.date,
          payment_method: item.payment_method,
          transaction_id: item.transaction_id,
          amount: Number(item.amount || 0),
          status: "Completed" as const,
        }));
        setBillingHistory(items);
        if (billingPayload.summary?.total_spent !== undefined) {
          setProfileStats((prev) => ({
            ...prev,
            total_spent: Number(billingPayload.summary?.total_spent ?? 0),
          }));
        }
      } else {
        setBillingHistory([]);
      }

      if (caseStatsData.status === "fulfilled") {
        const stats = caseStatsData.value as { total_cases?: number; active_cases?: number };
        setProfileStats((prev) => ({
          ...prev,
          total_cases: Number(stats.total_cases ?? 0),
          active_cases: Number(stats.active_cases ?? 0),
        }));
      }

      if (dashboardStatsData.status === "fulfilled") {
        const stats = dashboardStatsData.value as { total_spent?: number };
        setProfileStats((prev) => ({
          ...prev,
          total_spent: Number(stats.total_spent ?? 0),
        }));
      }

      setIsEditing(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load profile";
      setError(errorMsg);
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancelEdit = () => {
    setFormData(formSnapshot);
    setIsEditing(false);
    setError(null);
  };

  const handleSaveProfile = async () => {
    const fullName = `${formData.first_name} ${formData.last_name}`.trim();
    if (!fullName) {
      setError("First name is required");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        full_name: fullName,
        date_of_birth: formData.date_of_birth || undefined,
        gender: formData.gender || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        pincode: formData.pincode || undefined,
        bio: formData.occupation || undefined,
        occupation: formData.occupation || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        aadhar_number: formData.aadhar_number || undefined,
      };

      const updatedProfile = (await citizensAPI.updateProfile(payload)) as CitizenProfileResponse;
      setProfile(updatedProfile);

      setFormSnapshot(formData);
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save profile";
      setError(errorMsg);
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSecurityInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecurityData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleSecurityVisibility = (
    key: "currentPassword" | "newPassword" | "confirmPassword"
  ) => {
    setShowSecurityField((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const loadTwoFactorStatus = async () => {
    setTwoFactorLoading(true);
    try {
      const response = (await citizensAPI.get2FAStatus()) as TwoFactorAuthResponse;
      setTwoFactorStatus(response);
    } catch {
      setTwoFactorStatus(null);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleUploadDocument = async (file: File) => {
    if (!profile?.user_id) return;

    setUploadingDocument(true);
    setError(null);
    setSuccess(false);

    try {
      const uploaded = (await citizensAPI.uploadDocument(file)) as {
        id?: number;
        file_name?: string;
        document_type?: string;
        file_url?: string;
        is_verified?: boolean;
        uploaded_at?: string;
        file_size?: number;
      };

      const bytes = Number(uploaded.file_size ?? file.size ?? 0);
      const fileSizeLabel =
        bytes > 1024 * 1024
          ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.max(1, Math.round(bytes / 1024))} KB`;

      const uploadedDate = uploaded.uploaded_at
        ? new Date(uploaded.uploaded_at).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);

      const newDocument: ProfileDocument = {
        id: `doc-${uploaded.id ?? Date.now()}`,
        file_name: uploaded.file_name || file.name,
        document_type: uploaded.document_type || "Document",
        file_size_label: fileSizeLabel,
        uploaded_at_label: `Uploaded ${uploadedDate}`,
        is_verified: Boolean(uploaded.is_verified),
        file_url: uploaded.file_url,
      };

      setDocuments((prev) => [newDocument, ...prev]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to upload document";
      setError(errorMsg);
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleStartTwoFactorSetup = async () => {
    setTwoFactorActionLoading(true);
    setSecurityMessage(null);
    setError(null);

    try {
      await citizensAPI.setup2FA({ auth_method: "totp" });
      setTwoFactorSetupStarted(true);
      await loadTwoFactorStatus();
      setSecurityMessage("2FA setup started. Enter the code from your authenticator app and verify to enable.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start 2FA setup";
      setError(msg);
    } finally {
      setTwoFactorActionLoading(false);
    }
  };

  const handleVerifyAndEnableTwoFactor = async () => {
    if (!twoFactorCode.trim()) {
      setError("Please enter the OTP code from your authenticator app.");
      return;
    }

    setTwoFactorActionLoading(true);
    setSecurityMessage(null);
    setError(null);

    try {
      await citizensAPI.verify2FA(twoFactorCode.trim());
      await citizensAPI.enable2FA(twoFactorCode.trim());
      await loadTwoFactorStatus();
      setTwoFactorCode("");
      setTwoFactorSetupStarted(false);
      setSecurityMessage("Two-factor authentication enabled successfully.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to verify and enable 2FA";
      setError(msg);
    } finally {
      setTwoFactorActionLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    setTwoFactorActionLoading(true);
    setSecurityMessage(null);
    setError(null);

    try {
      await citizensAPI.disable2FA();
      await loadTwoFactorStatus();
      setTwoFactorSetupStarted(false);
      setTwoFactorCode("");
      setSecurityMessage("Two-factor authentication disabled.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to disable 2FA";
      setError(msg);
    } finally {
      setTwoFactorActionLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setSecurityMessage(null);
    setError(null);

    if (!securityData.currentPassword || !securityData.newPassword || !securityData.confirmPassword) {
      setError("Please fill all password fields.");
      return;
    }

    if (securityData.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (securityData.newPassword !== securityData.confirmPassword) {
      setError("New password and confirm password must match.");
      return;
    }

    setSecuritySaving(true);
    try {
      await usersAPI.changePassword({
        current_password: securityData.currentPassword,
        new_password: securityData.newPassword,
      });
      setSecurityMessage("Password updated successfully.");
      setSecurityData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      setError(msg);
    } finally {
      setSecuritySaving(false);
    }
  };

  const handleNotificationToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!profile?.user_id) return;

    const prevState = notificationPrefs;
    const nextState = {
      ...prevState,
      [key]: value,
    };

    setNotificationPrefs(nextState);
    setNotificationSaved(false);
    setError(null);

    try {
      await citizensAPI.updateNotificationPreferences(nextState);
      setNotificationSaved(true);
      setTimeout(() => setNotificationSaved(false), 1500);
    } catch (err) {
      setNotificationPrefs(prevState);
      const msg = err instanceof Error ? err.message : "Failed to save notification preferences";
      setError(msg);
    }
  };

  useEffect(() => {
    if (activeTab === "security") {
      loadTwoFactorStatus();
    }
  }, [activeTab]);

  // Return null while checking authorization
  if (!isAuthorized) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const joinedOn = formatDate(profile?.created_at);
  const displayName = `${formData.first_name} ${formData.last_name}`.trim() || profile?.full_name || "User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join("")
    .toUpperCase();

  const tabButtonClass =
    "h-9 px-3 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-5xl font-semibold text-gray-900">My Profile</h2>
        <p className="text-lg text-gray-600 mt-1">Manage your personal information and preferences</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
          <Button size="sm" variant="outline" onClick={() => setError(null)} className="ml-auto">
            Dismiss
          </Button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-green-700">Profile updated successfully!</p>
        </div>
      )}

      <Card className="rounded-2xl border-gray-200">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex flex-col items-start lg:items-center gap-4 shrink-0">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profile?.profile_picture_url || ""} alt={displayName} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-5xl">{initials}</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="rounded-lg px-4">
                Change Photo
              </Button>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-4xl font-semibold text-gray-900">{displayName}</h3>
                  <p className="text-2xl text-gray-600 mt-1">{formData.occupation || "Citizen"}</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-0 rounded-full px-3 py-1 text-sm">
                  <CircleCheck className="w-3.5 h-3.5" />
                  {profile?.is_kyc_verified ? "Verified" : "Unverified"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mt-4 text-lg text-gray-700">
                <p className="inline-flex items-center gap-2 min-w-0">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate">{formData.email || "Not provided"}</span>
                </p>
                <p className="inline-flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{formData.phone || "Not provided"}</span>
                </p>
                <p className="inline-flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate">
                    {[formData.city, formData.state].filter(Boolean).join(", ") || "Not provided"}
                  </span>
                </p>
                <p className="inline-flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <span>Joined {joinedOn}</span>
                </p>
              </div>

              <div className="mt-5 border-t border-gray-200 pt-5 grid grid-cols-1 sm:grid-cols-3 text-center gap-5">
                <div>
                  <p className="text-4xl font-semibold text-gray-900">{profileStats.total_cases}</p>
                  <p className="text-lg text-gray-600 mt-1">Total Cases</p>
                </div>
                <div>
                  <p className="text-4xl font-semibold text-gray-900">{profileStats.active_cases}</p>
                  <p className="text-lg text-gray-600 mt-1">Active Cases</p>
                </div>
                <div>
                  <p className="text-4xl font-semibold text-gray-900">{formatCurrency(profileStats.total_spent)}</p>
                  <p className="text-lg text-gray-600 mt-1">Total Spent</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProfileTab)} className="w-full">
        <TabsList className="h-12 rounded-2xl bg-gray-100 p-1 w-auto inline-flex">
          <TabsTrigger value="personal" className={tabButtonClass}>
            Personal Information
          </TabsTrigger>
          <TabsTrigger value="security" className={tabButtonClass}>
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className={tabButtonClass}>
            Notifications
          </TabsTrigger>
          <TabsTrigger value="documents" className={tabButtonClass}>
            Documents
          </TabsTrigger>
          <TabsTrigger value="billing" className={tabButtonClass}>
            Billing History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <Card className="rounded-2xl border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h3 className="text-3xl font-semibold text-gray-900">Personal Information</h3>

                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-slate-950 hover:bg-slate-900 text-white rounded-xl px-4"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <Label htmlFor="first_name" className="text-gray-900 text-base font-medium">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-2 h-11 bg-gray-50 border-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name" className="text-gray-900 text-base font-medium">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-2 h-11 bg-gray-50 border-gray-100"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-900 text-base font-medium">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-2 h-11 bg-gray-50 border-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-900 text-base font-medium">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-2 h-11 bg-gray-50 border-gray-100"
                  />
                </div>

                <div>
                  <Label htmlFor="date_of_birth" className="text-gray-900 text-base font-medium">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-2 h-11 bg-gray-50 border-gray-100"
                    placeholder="DD-MM-YYYY"
                  />
                </div>
                <div>
                  <Label htmlFor="gender" className="text-gray-900 text-base font-medium">Gender</Label>
                  <Input
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-2 h-11 bg-gray-50 border-gray-100"
                  />
                </div>

                <div>
                  <Label htmlFor="occupation" className="text-gray-900 text-base font-medium">Occupation</Label>
                  <Input
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-2 h-11 bg-gray-50 border-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="aadhar_number" className="text-gray-900 text-base font-medium">Aadhar Number</Label>
                  <Input
                    id="aadhar_number"
                    name="aadhar_number"
                    value={formData.aadhar_number}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-2 h-11 bg-gray-50 border-gray-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address" className="text-gray-900 text-base font-medium">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-2 h-11 bg-gray-50 border-gray-100"
                  />
                </div>

                <div>
                  <Label htmlFor="city" className="text-gray-900 text-base font-medium">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-2 h-11 bg-gray-50 border-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-gray-900 text-base font-medium">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-2 h-11 bg-gray-50 border-gray-100"
                  />
                </div>

                <div>
                  <Label htmlFor="pincode" className="text-gray-900 text-base font-medium">Pincode</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-2 h-11 bg-gray-50 border-gray-100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <div className="space-y-4">
            <Card className="rounded-2xl border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-3xl font-semibold text-gray-900 mb-6">Change Password</h3>

                <div className="max-w-xl space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" className="text-base text-gray-900 font-medium">
                      Current Password
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showSecurityField.currentPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        value={securityData.currentPassword}
                        onChange={handleSecurityInputChange}
                        className="h-11 pr-10 bg-gray-50 border-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecurityVisibility("currentPassword")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        aria-label="Toggle current password visibility"
                      >
                        {showSecurityField.currentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword" className="text-base text-gray-900 font-medium">
                      New Password
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showSecurityField.newPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={securityData.newPassword}
                        onChange={handleSecurityInputChange}
                        className="h-11 pr-10 bg-gray-50 border-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecurityVisibility("newPassword")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        aria-label="Toggle new password visibility"
                      >
                        {showSecurityField.newPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-base text-gray-900 font-medium">
                      Confirm New Password
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showSecurityField.confirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={securityData.confirmPassword}
                        onChange={handleSecurityInputChange}
                        className="h-11 pr-10 bg-gray-50 border-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecurityVisibility("confirmPassword")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        aria-label="Toggle confirm password visibility"
                      >
                        {showSecurityField.confirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleUpdatePassword}
                    disabled={securitySaving}
                    className="bg-slate-950 hover:bg-slate-900 text-white rounded-xl px-4"
                  >
                    <Lock className="w-4 h-4" />
                    {securitySaving ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-3xl font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>

                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Shield className="w-8 h-8 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-2xl font-semibold text-gray-900">Two-Factor Authentication</p>
                      <p className="text-lg text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                  </div>

                  <Button
                    variant={twoFactorStatus?.is_enabled ? "outline" : "default"}
                    onClick={() => {
                      if (twoFactorStatus?.is_enabled) {
                        void handleDisableTwoFactor();
                      } else {
                        void handleStartTwoFactorSetup();
                      }
                    }}
                    disabled={twoFactorActionLoading || twoFactorLoading}
                    className={
                      twoFactorStatus?.is_enabled
                        ? "rounded-xl"
                        : "bg-white border border-gray-300 text-gray-900 hover:bg-gray-100 rounded-xl"
                    }
                  >
                    {twoFactorLoading
                      ? "Loading..."
                      : twoFactorActionLoading
                        ? "Please wait..."
                        : twoFactorStatus?.is_enabled
                          ? "Disable"
                          : "Start Setup"}
                  </Button>
                </div>

                {!twoFactorStatus?.is_enabled && twoFactorSetupStarted && (
                  <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-end gap-3">
                    <div className="w-full sm:max-w-xs">
                      <Label htmlFor="twoFactorCode" className="text-base text-gray-900 font-medium">
                        Verification Code
                      </Label>
                      <Input
                        id="twoFactorCode"
                        name="twoFactorCode"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        className="mt-2 h-11 bg-gray-50 border-gray-100"
                        placeholder="Enter 6-digit code"
                      />
                    </div>

                    <Button
                      onClick={() => void handleVerifyAndEnableTwoFactor()}
                      disabled={twoFactorActionLoading || !twoFactorCode.trim()}
                      className="bg-slate-950 hover:bg-slate-900 text-white rounded-xl px-4"
                    >
                      Verify and Enable
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-3xl font-semibold text-gray-900 mb-4">Active Sessions</h3>

                <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-2xl font-semibold text-gray-900">Current Session</p>
                    <p className="text-lg text-gray-700 inline-flex items-center gap-2 mt-1">
                      <Monitor className="w-4 h-4 text-gray-500" />
                      Chrome on Windows • Bengaluru, India
                    </p>
                    <p className="text-base text-gray-500 mt-1">Active now</p>
                  </div>

                  <Badge className="bg-emerald-100 text-emerald-700 border-0 rounded-full px-3 py-1 text-sm">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {securityMessage && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
                {securityMessage}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="rounded-2xl border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-3xl font-semibold text-gray-900">Notification Preferences</h3>
                  <p className="text-gray-600 mt-1">Choose which updates you want to receive.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Bell className="w-4 h-4" />
                  {notificationSaved ? "Saved" : "Auto-saved"}
                </div>
              </div>

              <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600 mt-0.5">Receive notifications via email</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notificationPrefs.email_notifications}
                    onClick={() =>
                      void handleNotificationToggle(
                        "email_notifications",
                        !notificationPrefs.email_notifications
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationPrefs.email_notifications ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        notificationPrefs.email_notifications ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-gray-900">SMS Notifications</p>
                    <p className="text-sm text-gray-600 mt-0.5">Receive notifications via SMS</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notificationPrefs.sms_notifications}
                    onClick={() =>
                      void handleNotificationToggle("sms_notifications", !notificationPrefs.sms_notifications)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationPrefs.sms_notifications ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        notificationPrefs.sms_notifications ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-gray-900">Case Updates</p>
                    <p className="text-sm text-gray-600 mt-0.5">Get notified about case status changes</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notificationPrefs.case_updates}
                    onClick={() =>
                      void handleNotificationToggle("case_updates", !notificationPrefs.case_updates)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationPrefs.case_updates ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        notificationPrefs.case_updates ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-gray-900">Consultation Reminders</p>
                    <p className="text-sm text-gray-600 mt-0.5">Reminders for upcoming consultations</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notificationPrefs.consultation_reminders}
                    onClick={() =>
                      void handleNotificationToggle(
                        "consultation_reminders",
                        !notificationPrefs.consultation_reminders
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationPrefs.consultation_reminders ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        notificationPrefs.consultation_reminders ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-gray-900">Payment Alerts</p>
                    <p className="text-sm text-gray-600 mt-0.5">Alerts for payment confirmations and dues</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notificationPrefs.payment_alerts}
                    onClick={() =>
                      void handleNotificationToggle("payment_alerts", !notificationPrefs.payment_alerts)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationPrefs.payment_alerts ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        notificationPrefs.payment_alerts ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-gray-900">Marketing Emails</p>
                    <p className="text-sm text-gray-600 mt-0.5">Promotional offers and updates</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notificationPrefs.marketing_emails}
                    onClick={() =>
                      void handleNotificationToggle(
                        "marketing_emails",
                        !notificationPrefs.marketing_emails
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationPrefs.marketing_emails ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        notificationPrefs.marketing_emails ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card className="rounded-2xl border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h3 className="text-3xl font-semibold text-gray-900">My Documents</h3>

                <label>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(event) => {
                      const nextFile = event.target.files?.[0];
                      if (nextFile) {
                        void handleUploadDocument(nextFile);
                      }

                      event.currentTarget.value = "";
                    }}
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  />
                  <span
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white cursor-pointer ${
                      uploadingDocument ? "bg-slate-700" : "bg-slate-950 hover:bg-slate-900"
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingDocument ? "Uploading..." : "Upload Document"}
                  </span>
                </label>
              </div>

              <div className="space-y-3">
                {documents.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center text-gray-600">
                    No documents uploaded yet.
                  </div>
                )}

                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-xl border border-gray-200 bg-white px-5 py-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-2xl font-semibold text-gray-900 truncate">{doc.file_name}</p>
                          {doc.is_verified && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 rounded-full px-2.5 py-0.5 text-xs">
                              <CircleCheck className="w-3 h-3" />
                              Verified
                            </Badge>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-gray-600 text-base">
                          <Badge variant="outline" className="bg-white text-gray-800 border-gray-200">
                            {doc.document_type}
                          </Badge>
                          <span>•</span>
                          <span>{doc.file_size_label}</span>
                          <span>•</span>
                          <span>{doc.uploaded_at_label}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Preview document"
                        onClick={() => {
                          if (doc.file_url) {
                            window.open(doc.file_url, "_blank", "noopener,noreferrer");
                          }
                        }}
                        disabled={!doc.file_url}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Download document"
                        onClick={() => {
                          if (doc.file_url) {
                            const anchor = document.createElement("a");
                            anchor.href = doc.file_url;
                            anchor.download = doc.file_name;
                            anchor.click();
                          }
                        }}
                        disabled={!doc.file_url}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <Card className="rounded-2xl border-gray-200">
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-3xl font-semibold text-gray-900">Billing History</h3>
                <p className="text-gray-600 mt-2">Total Spent</p>
                <p className="text-4xl font-semibold text-gray-900 mt-1">
                  {formatCurrency(profileStats.total_spent)}
                </p>
              </div>

              <div className="space-y-3">
                {billingHistory.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center text-gray-600">
                    No billing entries found.
                  </div>
                )}

                {billingHistory.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-gray-200 bg-white px-5 py-4 flex items-start justify-between gap-4"
                  >
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600 mt-1 flex flex-wrap items-center gap-2">
                        <span>{formatDate(item.date)}</span>
                        <span>•</span>
                        <span>{item.payment_method}</span>
                        <span>•</span>
                        <span>{item.transaction_id}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xl font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
                      <Badge className="mt-1 bg-emerald-100 text-emerald-700 border-0 rounded-full px-2.5 py-0.5 text-xs">
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
