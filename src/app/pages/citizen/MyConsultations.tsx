import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Calendar,
  Clock3,
  FileText,
  MessageSquare,
  Phone,
  Search,
  Video,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useCitizenRouteGuard } from "../../hooks/useCitizenRouteGuard";
import { citizensAPI } from "../../services/api";
import { ConsultationDetailsDialog } from "./ConsultationDetailsDialog";
import type {
  ActionFlags,
  AttachmentInfo,
  ConsultationCard,
  ConsultationMode,
  ConsultationSummaryResponse,
} from "../../services/types/citizenConsultations";
import {
  formatCurrencyINR,
  formatDateTime,
  formatDuration,
  getInitials,
  getPaymentStyle,
  getStatusStyle,
} from "../../utils/consultationFormatters";

const DEFAULT_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 350;

type TabKey = "all" | "scheduled" | "completed" | "cancelled";

function toNumber(value: unknown, fallback: number = 0): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeAttachment(item: unknown, index: number): AttachmentInfo {
  if (typeof item === "string") {
    return { id: index, name: item };
  }

  if (item && typeof item === "object") {
    const payload = item as Record<string, unknown>;
    return {
      id: (payload.id as string | number | undefined) ?? index,
      name: String(payload.name ?? payload.filename ?? payload.title ?? `Attachment ${index + 1}`),
      url: typeof payload.url === "string" ? payload.url : undefined,
    };
  }

  return {
    id: index,
    name: `Attachment ${index + 1}`,
  };
}

function normalizeActions(raw: Record<string, unknown>, status: string): ActionFlags {
  const lowerStatus = status.toLowerCase();
  const canJoinByStatus = lowerStatus === "scheduled";
  return {
    can_join_meeting: Boolean(raw.can_join_meeting ?? canJoinByStatus),
    can_reschedule: Boolean(raw.can_reschedule ?? canJoinByStatus),
    can_cancel: Boolean(raw.can_cancel ?? canJoinByStatus),
    can_view_details: Boolean(raw.can_view_details ?? true),
  };
}

function normalizeConsultation(item: unknown): ConsultationCard {
  const payload = (item ?? {}) as Record<string, unknown>;
  const status = String(payload.status ?? "scheduled");

  const lawyerRaw = (payload.lawyer ?? {}) as Record<string, unknown>;
  const lawyerName =
    String(lawyerRaw.name ?? payload.lawyer_name ?? payload.lawyer ?? "Lawyer") || "Lawyer";

  const feeRaw = (payload.fee ?? {}) as Record<string, unknown>;
  const feeAmount = toNumber(feeRaw.amount ?? payload.fee_amount ?? 0, 0);

  const attachmentsRaw = Array.isArray(payload.attachments)
    ? payload.attachments
    : Array.isArray(payload.documents)
      ? payload.documents
      : [];

  const actionsRaw = (payload.actions ?? {}) as Record<string, unknown>;

  return {
    id: toNumber(payload.id, Date.now()),
    consultation_code: String(payload.consultation_code ?? payload.code ?? `CONS-${payload.id ?? "--"}`),
    status,
    consultation_mode: String(payload.consultation_mode ?? payload.mode ?? payload.consultation_type ?? "video"),
    scheduled_at: String(payload.scheduled_at ?? payload.consultation_date ?? ""),
    duration_minutes: toNumber(payload.duration_minutes, 0),
    note: String(payload.note ?? payload.notes ?? ""),
    attachments: attachmentsRaw.map((entry, index) => normalizeAttachment(entry, index)),
    lawyer: {
      id: toNumber(lawyerRaw.id ?? payload.lawyer_id, 0),
      name: lawyerName,
      initials: String(lawyerRaw.initials ?? getInitials(lawyerName)),
      specialization: String(lawyerRaw.specialization ?? payload.specialization ?? "General Law"),
      rating: toNumber(lawyerRaw.rating ?? payload.rating, 0),
    },
    case: {
      id: toNumber((payload.case as Record<string, unknown> | undefined)?.id ?? payload.case_id, 0),
      title: String((payload.case as Record<string, unknown> | undefined)?.title ?? payload.case_title ?? ""),
      case_code: String((payload.case as Record<string, unknown> | undefined)?.case_code ?? payload.case_code ?? ""),
    },
    fee: {
      amount: feeAmount,
      payment_status: String(feeRaw.payment_status ?? payload.payment_status ?? "pending"),
      currency: String(feeRaw.currency ?? payload.currency ?? "INR"),
    },
    actions: normalizeActions(actionsRaw, status),
    meeting_url: typeof payload.meeting_url === "string" ? payload.meeting_url : undefined,
  };
}

function normalizeResponse(data: unknown): ConsultationSummaryResponse {
  const payload = (data ?? {}) as Record<string, unknown>;
  const summaryRaw = (payload.summary ?? {}) as Record<string, unknown>;

  const summary = {
    total: toNumber(summaryRaw.total ?? payload.total_consultations ?? 0),
    upcoming: toNumber(summaryRaw.upcoming ?? (payload.status_breakdown as Record<string, unknown> | undefined)?.scheduled ?? 0),
    completed: toNumber(summaryRaw.completed ?? (payload.status_breakdown as Record<string, unknown> | undefined)?.completed ?? 0),
    cancelled: toNumber(summaryRaw.cancelled ?? (payload.status_breakdown as Record<string, unknown> | undefined)?.cancelled ?? 0),
  };

  const consultations = Array.isArray(payload.consultations)
    ? payload.consultations.map((item) => normalizeConsultation(item))
    : [];

  const paginationRaw = (payload.pagination ?? {}) as Record<string, unknown>;
  const filtersRaw = (payload.filters ?? {}) as Record<string, unknown>;

  return {
    summary,
    consultations,
    filters: {
      status: typeof filtersRaw.status === "string" ? filtersRaw.status : undefined,
      mode: typeof filtersRaw.mode === "string" ? filtersRaw.mode : undefined,
      q: typeof filtersRaw.q === "string" ? filtersRaw.q : undefined,
      skip: toNumber(filtersRaw.skip, 0),
      limit: toNumber(filtersRaw.limit, DEFAULT_LIMIT),
    },
    pagination: {
      skip: toNumber(paginationRaw.skip, 0),
      limit: toNumber(paginationRaw.limit, DEFAULT_LIMIT),
      total: toNumber(paginationRaw.total, summary.total),
      returned: toNumber(paginationRaw.returned, consultations.length),
    },
    status_breakdown: (payload.status_breakdown as Record<string, number> | undefined) ?? {},
    type_breakdown: (payload.type_breakdown as Record<string, number> | undefined) ?? {},
    total_fee_spent: toNumber(payload.total_fee_spent, 0),
  };
}

function getModeIcon(mode?: string) {
  const normalized = (mode ?? "").toLowerCase();
  if (normalized.includes("video")) return <Video className="w-4 h-4 text-gray-500" />;
  if (normalized.includes("phone")) return <Phone className="w-4 h-4 text-gray-500" />;
  return <MessageSquare className="w-4 h-4 text-gray-500" />;
}

export function MyConsultations() {
  const isAuthorized = useCitizenRouteGuard();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const status = (searchParams.get("status") ?? "all") as TabKey;
  const mode = (searchParams.get("mode") ?? "all") as ConsultationMode;
  const q = searchParams.get("q") ?? "";
  const skip = toNumber(searchParams.get("skip"), 0);
  const limit = toNumber(searchParams.get("limit"), DEFAULT_LIMIT);

  const [searchInput, setSearchInput] = useState(q);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ConsultationSummaryResponse | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState<number | null>(null);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput === q) return;
      const next = new URLSearchParams(searchParams);
      if (searchInput.trim()) {
        next.set("q", searchInput.trim());
      } else {
        next.delete("q");
      }
      next.set("skip", "0");
      setSearchParams(next);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput, q, searchParams, setSearchParams]);

  useEffect(() => {
    if (!isAuthorized) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await citizensAPI.getConsultationsSummary({
          status,
          mode,
          q,
          skip,
          limit,
        });
        setData(normalizeResponse(response));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load consultations");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthorized, status, mode, q, skip, limit]);

  const summary = data?.summary ?? {
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  };

  const consultations = data?.consultations ?? [];
  const pagination = data?.pagination ?? {
    skip: 0,
    limit: DEFAULT_LIMIT,
    total: 0,
    returned: 0,
  };

  const activeTab = useMemo<TabKey>(() => {
    if (status === "scheduled" || status === "completed" || status === "cancelled") {
      return status;
    }
    return "all";
  }, [status]);

  const updateQuery = (changes: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === "all") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    setSearchParams(next);
  };

  const handleTabChange = (tab: TabKey) => {
    updateQuery({ status: tab, skip: 0 });
  };

  const handleStatusChange = (nextStatus: string) => {
    updateQuery({ status: nextStatus, skip: 0 });
  };

  const handleModeChange = (nextMode: string) => {
    updateQuery({ mode: nextMode, skip: 0 });
  };

  const handlePageChange = (nextSkip: number) => {
    updateQuery({ skip: Math.max(nextSkip, 0) });
  };

  const openMeeting = (consultation: ConsultationCard) => {
    if (consultation.meeting_url) {
      window.open(consultation.meeting_url, "_blank", "noopener,noreferrer");
      return;
    }
    setActionNotice("Meeting link is not available for this consultation.");
  };

  const openReschedule = () => {
    setActionNotice("Reschedule flow will be connected when the endpoint is finalized.");
  };

  const openCancel = () => {
    setActionNotice("Cancel flow will be connected when the endpoint is finalized.");
  };

  const openDetails = (consultationId: number) => {
    setSelectedConsultationId(consultationId);
    setDetailsOpen(true);
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900">My Consultations</h2>
          <p className="text-gray-600 mt-1">View and manage your legal consultations</p>
        </div>
        <Button className="self-start" onClick={() => navigate("/find-lawyers")}>
          + Book Consultation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-3xl font-semibold text-gray-900 mt-1">{summary.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Upcoming</p>
            <p className="text-3xl font-semibold text-gray-900 mt-1">{summary.upcoming}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-3xl font-semibold text-gray-900 mt-1">{summary.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Cancelled</p>
            <p className="text-3xl font-semibold text-gray-900 mt-1">{summary.cancelled}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 grid grid-cols-1 lg:grid-cols-[1.2fr_0.6fr_0.6fr] gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by lawyer, consultation ID, or case"
              className="pl-9"
            />
          </div>

          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={mode} onValueChange={handleModeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "all" as TabKey, label: `All (${summary.total})` },
          { key: "scheduled" as TabKey, label: `Upcoming (${summary.upcoming})` },
          { key: "completed" as TabKey, label: `Completed (${summary.completed})` },
          { key: "cancelled" as TabKey, label: `Cancelled (${summary.cancelled})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {actionNotice && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {actionNotice}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-center justify-between gap-2">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={() => updateQuery({ skip })}>
            Retry
          </Button>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6 animate-pulse">
                <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
                <div className="h-3 w-64 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-48 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && consultations.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center space-y-3">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">No consultations found</h3>
            <p className="text-sm text-gray-600">
              {q || status !== "all" || mode !== "all"
                ? "Try changing filters or search query."
                : "Book your first consultation to get started."}
            </p>
            <Button onClick={() => navigate("/find-lawyers")}>Book Consultation</Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && consultations.length > 0 && (
        <div className="space-y-4">
          {consultations.map((consultation) => (
            <Card key={consultation.id} className="border-gray-200">
              <CardContent className="p-5">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                  <div className="xl:col-span-4">
                    <div className="flex gap-4">
                      <div className="h-14 w-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                        {consultation.lawyer?.initials || getInitials(consultation.lawyer?.name)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-semibold text-gray-900 leading-tight">{consultation.lawyer?.name}</p>
                        <p className="text-sm text-gray-600">{consultation.lawyer?.specialization || "General Law"}</p>
                        <div className="flex items-center gap-2">
                          {consultation.lawyer?.rating ? (
                            <span className="text-sm font-medium text-gray-800">{`★ ${consultation.lawyer.rating.toFixed(1)}`}</span>
                          ) : null}
                          <Badge className={getStatusStyle(consultation.status)}>{consultation.status}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{formatDateTime(consultation.scheduled_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock3 className="w-4 h-4 text-gray-500" />
                        <span>{formatDuration(consultation.duration_minutes)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getModeIcon(consultation.consultation_mode)}
                        <span className="capitalize">{consultation.consultation_mode || "video"} Call</span>
                      </div>
                    </div>

                    {consultation.case?.title ? (
                      <Badge variant="outline" className="mt-3">{consultation.case.title}</Badge>
                    ) : null}
                  </div>

                  <div className="xl:col-span-5 space-y-3">
                    {consultation.note ? (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                        <p className="text-xs font-semibold text-blue-700 mb-1">Note</p>
                        <p className="text-sm text-blue-800">{consultation.note}</p>
                      </div>
                    ) : null}

                    {consultation.attachments && consultation.attachments.length > 0 ? (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Attached Documents:</p>
                        <div className="flex flex-wrap gap-2">
                          {consultation.attachments.map((attachment) => (
                            <Badge key={attachment.id} variant="outline" className="gap-1">
                              <FileText className="w-3 h-3" />
                              {attachment.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="xl:col-span-3 space-y-2">
                    <div className="rounded-lg bg-slate-100 px-4 py-3">
                      <p className="text-xs text-gray-600">Consultation Fee</p>
                      <p className="text-3xl font-semibold text-slate-900 mt-1">
                        {formatCurrencyINR(consultation.fee?.amount ?? 0)}
                      </p>
                      <Badge className={`mt-2 ${getPaymentStyle(consultation.fee?.payment_status)}`}>
                        {consultation.fee?.payment_status || "pending"}
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-500">{consultation.consultation_code || "N/A"}</p>

                    {consultation.actions?.can_view_details ? (
                      <Button className="w-full" onClick={() => openDetails(consultation.id)}>
                        View Details
                      </Button>
                    ) : null}

                    {consultation.actions?.can_join_meeting ? (
                      <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => openMeeting(consultation)}>
                        Join Meeting
                      </Button>
                    ) : null}

                    {consultation.actions?.can_reschedule ? (
                      <Button variant="outline" className="w-full" onClick={openReschedule}>
                        Reschedule
                      </Button>
                    ) : null}

                    {consultation.actions?.can_cancel ? (
                      <Button variant="outline" className="w-full text-red-600" onClick={openCancel}>
                        Cancel
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && pagination.total > pagination.limit && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            disabled={pagination.skip <= 0}
            onClick={() => handlePageChange(pagination.skip - pagination.limit)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={pagination.skip + pagination.limit >= pagination.total}
            onClick={() => handlePageChange(pagination.skip + pagination.limit)}
          >
            Next
          </Button>
        </div>
      )}

      {!loading && !error && data?.total_fee_spent ? (
        <p className="text-sm text-gray-500 text-right">Total fee spent: {formatCurrencyINR(data.total_fee_spent)}</p>
      ) : null}

      <ConsultationDetailsDialog
        consultationId={selectedConsultationId}
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) {
            setSelectedConsultationId(null);
          }
        }}
        onNotice={(message) => setActionNotice(message)}
      />
    </div>
  );
}
