import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Calendar, Users, CheckCircle, Clock, AlertCircle, Loader, User } from "lucide-react";
import { citizensAPI, consultationsAPI } from "../../services/api";
import { useCitizenRouteGuard } from "../../hooks/useCitizenRouteGuard";

interface ConsultationSummary {
  total_consultations: number;
  status_breakdown: Record<string, number>;
  type_breakdown: Record<string, number>;
  total_fee_spent: number;
}

interface Consultation {
  id: number;
  user_id: number;
  lawyer_id: number;
  consultation_type?: string;
  status: string;
  scheduled_at?: string;
  consultation_date?: string;
  duration_minutes?: number;
  fee_amount?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export function MyConsultations() {
  // Protect route - only citizens can access
  const isAuthorized = useCitizenRouteGuard();

  const navigate = useNavigate();
  const [summary, setSummary] = useState<ConsultationSummary | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current user ID from token
      const token = localStorage.getItem("authToken");
      let userId: number | null = null;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          userId = payload.sub;
        } catch {
          userId = null;
        }
      }

      // Load summary
      const summaryData = (await citizensAPI.getConsultationsSummary()) as ConsultationSummary;
      setSummary(summaryData);

      // Load detailed consultations
      if (userId) {
        const consultationsData = (await consultationsAPI.getUserConsultations(userId, 0, 50)) as Consultation[];
        setConsultations(Array.isArray(consultationsData) ? consultationsData : []);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load consultations";
      setError(errorMsg);
      console.error("Error loading consultations:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("completed") || statusLower.includes("done")) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (statusLower.includes("scheduled") || statusLower.includes("confirmed")) return <Calendar className="w-5 h-5 text-blue-600" />;
    if (statusLower.includes("pending") || statusLower.includes("awaiting")) return <Clock className="w-5 h-5 text-yellow-600" />;
    if (statusLower.includes("cancelled") || statusLower.includes("failed")) return <AlertCircle className="w-5 h-5 text-red-600" />;
    return <Calendar className="w-5 h-5 text-gray-600" />;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("completed") || statusLower.includes("done")) return "bg-green-100 text-green-700";
    if (statusLower.includes("scheduled") || statusLower.includes("confirmed")) return "bg-blue-100 text-blue-700";
    if (statusLower.includes("pending") || statusLower.includes("awaiting")) return "bg-yellow-100 text-yellow-700";
    if (statusLower.includes("cancelled") || statusLower.includes("failed")) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Return null while checking authorization
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900">My Consultations</h2>
        <p className="text-gray-600 mt-1">View and manage your consultations</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading consultations...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error loading consultations: {error}</p>
          <Button size="sm" className="mt-2" onClick={loadData}>
            Try Again
          </Button>
        </div>
      )}

      {/* Summary Statistics */}
      {!loading && !error && summary && (
        <>
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Consultations</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {summary.total_consultations}
                    </p>
                  </div>
                  <Users className="w-12 h-12 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Fee Spent</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      ₹{summary.total_fee_spent.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <IndianRupee className="w-12 h-12 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Breakdown */}
          {Object.keys(summary.status_breakdown).length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Status Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(summary.status_breakdown).map(([status, count]) => (
                    <div key={status} className="text-center">
                      <div className="flex justify-center mb-2">
                        {getStatusIcon(status)}
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                      <p className="text-xs text-gray-600 mt-1 capitalize">{status}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Type Breakdown */}
          {Object.keys(summary.type_breakdown).length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Consultation Types</h3>
                <div className="space-y-3">
                  {Object.entries(summary.type_breakdown).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-gray-700">{type || "General Consultation"}</span>
                      <Badge variant="secondary">
                        {count} {count === 1 ? "consultation" : "consultations"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Consultations List */}
          {consultations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Consultations</h3>
              {consultations.map((consultation) => (
                <Card key={consultation.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Type and Status */}
                        <div className="flex items-center gap-3 mb-3">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-gray-900">
                            {consultation.consultation_type || "General Consultation"}
                          </h4>
                          <Badge className={`${getStatusColor(consultation.status)} border-0`}>
                            {consultation.status}
                          </Badge>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {/* Date/Time */}
                          <div>
                            <p className="text-gray-600 text-xs mb-1">Scheduled For</p>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">
                                {formatDate(consultation.scheduled_at || consultation.consultation_date)}
                              </span>
                            </div>
                          </div>

                          {/* Duration */}
                          {consultation.duration_minutes && (
                            <div>
                              <p className="text-gray-600 text-xs mb-1">Duration</p>
                              <span className="text-gray-700">
                                {consultation.duration_minutes} mins
                              </span>
                            </div>
                          )}

                          {/* Fee */}
                          {consultation.fee_amount && (
                            <div>
                              <p className="text-gray-600 text-xs mb-1">Fee</p>
                              <div className="flex items-center gap-1">
                                <IndianRupee className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">
                                  ₹{consultation.fee_amount.toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Lawyer ID */}
                          <div>
                            <p className="text-gray-600 text-xs mb-1">Lawyer ID</p>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">#{consultation.lawyer_id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        {consultation.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-600">
                            <p className="font-medium text-gray-700 mb-1">Notes:</p>
                            <p>{consultation.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 space-y-2">
                        <Button size="sm" variant="outline" className="w-full" onClick={() => navigate("/find-lawyers")}>
                          Contact Lawyer
                        </Button>
                        {consultation.status.toLowerCase() === "scheduled" && (
                          <Button size="sm" variant="outline" className="w-full" onClick={() => navigate("/find-lawyers")}>
                            Find Another
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {summary.total_consultations === 0 && (
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No consultations scheduled yet.</p>
              <Button onClick={() => navigate("/find-lawyers")}>Book a Consultation</Button>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
