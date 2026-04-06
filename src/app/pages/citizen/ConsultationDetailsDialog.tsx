import { useEffect, useMemo, useState } from "react";
import { Phone, Video, MessageSquare, ExternalLink, Loader2, Paperclip } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { citizensAPI } from "../../services/api";
import type { ConsultationDetailResponse } from "../../services/types/citizenConsultations";
import { formatCurrencyINR, formatDateTime, formatDuration, getInitials, getPaymentStyle, getStatusStyle } from "../../utils/consultationFormatters";

interface ConsultationDetailsDialogProps {
  consultationId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNotice?: (message: string) => void;
}

function getModeIcon(mode?: string) {
  const normalized = (mode ?? "").toLowerCase();
  if (normalized.includes("video")) return <Video className="w-4 h-4" />;
  if (normalized.includes("phone")) return <Phone className="w-4 h-4" />;
  return <MessageSquare className="w-4 h-4" />;
}

function getJoinLabel(mode?: string) {
  const normalized = (mode ?? "").toLowerCase();
  if (normalized.includes("video")) return "Join Video Consultation";
  if (normalized.includes("phone")) return "Join Phone Consultation";
  return "Join Consultation";
}

export function ConsultationDetailsDialog({ consultationId, open, onOpenChange, onNotice }: ConsultationDetailsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<ConsultationDetailResponse | null>(null);

  useEffect(() => {
    if (!open || consultationId === null) {
      return;
    }

    let mounted = true;

    const loadDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await citizensAPI.getConsultationDetails(consultationId);
        if (!mounted) return;
        setDetails(response);
      } catch (fetchError) {
        if (!mounted) return;
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load consultation details");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDetails();

    return () => {
      mounted = false;
    };
  }, [open, consultationId]);

  const lawyerName = details?.lawyer_information.name ?? "Lawyer";
  const lawyerInitials = details?.lawyer_information.initials ?? getInitials(lawyerName);
  const mode = details?.consultation_details.mode ?? "video";
  const feeAmount = details?.consultation_details.fee?.amount ?? details?.payment_information?.consultation_fee ?? 0;
  const meetingLink = details?.consultation_details.meeting_link;
  const canJoinMeeting = Boolean(details?.actions?.can_join_meeting && meetingLink);
  const canReschedule = Boolean(details?.actions?.can_reschedule);
  const canCancel = Boolean(details?.actions?.can_cancel);
  const canViewDetails = Boolean(details?.actions?.can_view_details ?? true);

  const paymentBadgeClass = useMemo(() => getPaymentStyle(details?.payment_information?.status), [details?.payment_information?.status]);

  const handleJoin = () => {
    if (!meetingLink) {
      onNotice?.("Meeting link is not available for this consultation.");
      return;
    }
    window.open(meetingLink, "_blank", "noopener,noreferrer");
  };

  const handleReschedule = () => {
    onNotice?.("Reschedule flow will be connected when the endpoint is finalized.");
  };

  const handleCancel = () => {
    onNotice?.("Cancel flow will be connected when the endpoint is finalized.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6 space-y-5">
          <DialogHeader className="flex-row items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-2xl">Consultation Details</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">{details?.consultation_code ?? "CONS-—"}</p>
            </div>
            {details?.status ? (
              <Badge className={getStatusStyle(details.status)}>{details.status}</Badge>
            ) : null}
          </DialogHeader>

          {loading && (
            <div className="flex min-h-[340px] items-center justify-center rounded-lg border border-gray-200 bg-white">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading consultation details...
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              <p className="font-medium">Unable to load consultation details</p>
              <p className="text-sm mt-1">{error}</p>
              <Button className="mt-4" variant="outline" onClick={() => setError(null)}>
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && details && (
            <div className="space-y-4">
              <section className="rounded-2xl border border-gray-200 p-5 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Lawyer Information</h3>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-semibold">
                      {lawyerInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-gray-900">{lawyerName}</p>
                    <p className="text-sm text-gray-600">{details.lawyer_information.specialization ?? "General Law"}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-amber-500">★</span>
                      <span>{details.lawyer_information.rating?.toFixed(1) ?? "0.0"}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 p-5 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Consultation Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Date & Time</p>
                    <p className="font-semibold text-gray-900">{formatDateTime(details.consultation_details.date_time)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Duration</p>
                    <p className="font-semibold text-gray-900">{formatDuration(details.consultation_details.duration_minutes)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Mode</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      {getModeIcon(mode)}
                      <span>{details.consultation_details.mode ?? "Video Call"}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Fee</p>
                    <p className="font-semibold text-gray-900">{formatCurrencyINR(feeAmount)}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-gray-500">Related Case</p>
                    <p className="font-semibold text-gray-900">{details.consultation_details.related_case?.title ?? "-"}</p>
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <p className="text-gray-500">Meeting Link</p>
                    <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-green-800 text-sm">
                      {meetingLink ? meetingLink : "Meeting link will appear here when available."}
                    </div>
                    {canJoinMeeting ? (
                      <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleJoin}>
                        <Video className="w-4 h-4 mr-2" />
                        {getJoinLabel(mode)}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 p-5 space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Preparation Notes</h3>
                <p className="text-sm text-gray-700 leading-6">
                  {details.preparation_notes || "No preparation notes were provided for this consultation."}
                </p>
              </section>

              <section className="rounded-2xl border border-gray-200 p-5 space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                {details.documents && details.documents.length > 0 ? (
                  <div className="space-y-2">
                    {details.documents.map((document) => (
                      <div key={String(document.id ?? document.name)} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Paperclip className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          {document.url ? (
                            <a href={document.url} target="_blank" rel="noreferrer" className="truncate text-sm font-medium text-blue-700 hover:underline">
                              {document.name}
                            </a>
                          ) : (
                            <span className="truncate text-sm font-medium text-gray-900">{document.name}</span>
                          )}
                        </div>
                        {document.mime_type ? <span className="text-xs text-gray-500">{document.mime_type}</span> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No documents attached.</p>
                )}
              </section>

              <section className="rounded-2xl border border-gray-200 p-5 space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Consultation Fee</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatCurrencyINR(details.payment_information?.consultation_fee ?? feeAmount)}</p>
                  </div>
                  <Badge className={paymentBadgeClass}>{details.payment_information?.status ?? "pending"}</Badge>
                </div>
              </section>
            </div>
          )}

          <DialogFooter className="sm:justify-between gap-2 pt-2">
            <div className="flex flex-wrap gap-2">
              {canViewDetails ? (
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {canReschedule ? (
                <Button variant="outline" onClick={handleReschedule}>
                  Reschedule
                </Button>
              ) : null}
              {canCancel ? (
                <Button variant="outline" className="text-red-600" onClick={handleCancel}>
                  Cancel Consultation
                </Button>
              ) : null}
              {canJoinMeeting ? (
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleJoin}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {getJoinLabel(mode)}
                </Button>
              ) : null}
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
