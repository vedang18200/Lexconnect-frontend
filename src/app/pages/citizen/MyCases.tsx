import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Briefcase, Calendar, User, ChevronRight, Loader } from "lucide-react";
import { citizensAPI } from "../../services/api";
import { useCitizenRouteGuard } from "../../hooks/useCitizenRouteGuard";

interface CaseSummaryItem {
  id: number;
  title: string;
  lawyer: string;
  status: string;
  nextHearing: string | null;
  description?: string;
}

export function MyCases() {
  // Protect route - only citizens can access
  const isAuthorized = useCitizenRouteGuard();

  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await citizensAPI.getCasesSummary()) as CaseSummaryItem[];
      setCases(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load cases";
      setError(errorMsg);
      console.error("Error loading cases:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("active") || statusLower.includes("ongoing")) return "bg-blue-100 text-blue-700";
    if (statusLower.includes("closed") || statusLower.includes("resolved")) return "bg-green-100 text-green-700";
    if (statusLower.includes("pending")) return "bg-yellow-100 text-yellow-700";
    if (statusLower.includes("appeal")) return "bg-purple-100 text-purple-700";
    return "bg-gray-100 text-gray-700";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Return null while checking authorization
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900">My Cases</h2>
        <p className="text-gray-600 mt-1">Manage and track all your legal cases</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading your cases...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error loading cases: {error}</p>
          <Button size="sm" className="mt-2" onClick={loadCases}>
            Try Again
          </Button>
        </div>
      )}

      {/* Cases List */}
      {!loading && !error && (
        <>
          <p className="text-sm text-gray-600">
            {cases.length} {cases.length === 1 ? "case" : "cases"} found
          </p>

          {cases.length === 0 ? (
            <Card className="p-8 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No cases found. Start by consulting with a lawyer.</p>
              <Button onClick={() => navigate("/find-lawyers")}>Find a Lawyer</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {cases.map((caseItem) => (
                <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Case Title */}
                        <div className="flex items-center gap-3 mb-3">
                          <Briefcase className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <h3 className="font-semibold text-lg text-gray-900 truncate">
                            {caseItem.title}
                          </h3>
                        </div>

                        {/* Description */}
                        {caseItem.description && (
                          <p className="text-sm text-gray-600 mb-4">{caseItem.description}</p>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                          {/* Status */}
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Status</p>
                            <Badge className={`${getStatusColor(caseItem.status)} border-0`}>
                              {caseItem.status}
                            </Badge>
                          </div>

                          {/* Lawyer */}
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Assigned Lawyer</p>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{caseItem.lawyer}</span>
                            </div>
                          </div>

                          {/* Next Hearing */}
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Next Hearing</p>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{formatDate(caseItem.nextHearing)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0"
                        onClick={() => alert(`Case Details: ${caseItem.title}\n\nCase ID: ${caseItem.id}\n\nDetailed view coming soon!`)}
                      >
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
