import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Briefcase, AlertCircle, CheckCircle, Clock, Loader, Search, User, TrendingUp, Calendar } from "lucide-react";
import { citizensAPI } from "../../services/api";
import { useCitizenRouteGuard } from "../../hooks/useCitizenRouteGuard";
import type { MyCasesResponse, MyCasesListResponse, CaseStatistics } from "../../services/types";

export function MyCases() {
  // Protect route - only citizens can access
  useCitizenRouteGuard();

  const navigate = useNavigate();

  // Statistics State
  const [statistics, setStatistics] = useState<CaseStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Cases List State
  const [cases, setCases] = useState<MyCasesResponse[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const [casesError, setCasesError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Filter State
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
ReturnType<typeof setTimeout>
  const pageSize = 10;

  // Load statistics on mount
  useEffect(() => {
    loadStatistics();
  }, []);

  // Load cases when filters or page changes
  useEffect(() => {
    loadCases();
  }, [statusFilter, priorityFilter, currentPage]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);

    const timeout = setTimeout(() => {
      setCurrentPage(1); // Reset to first page
      loadCases();
    }, 300);

    setSearchTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const loadStatistics = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const data = (await citizensAPI.getCaseStatistics()) as CaseStatistics;
      setStatistics(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load statistics";
      setStatsError(errorMsg);
      console.error("Error loading statistics:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadCases = async () => {
    setCasesLoading(true);
    setCasesError(null);
    try {
      const response = (await citizensAPI.getMyCases({
        status_filter: statusFilter !== "all" ? statusFilter : undefined,
        priority_filter: priorityFilter !== "all" ? priorityFilter : undefined,
        search: searchQuery.trim() || undefined,
        skip: (currentPage - 1) * pageSize,
        limit: pageSize,
      })) as MyCasesListResponse;

      setCases(response.cases || []);
      setTotal(response.total || 0);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load cases";
      setCasesError(errorMsg);
      console.error("Error loading cases:", err);
    } finally {
      setCasesLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string | null | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-300";
    switch (status.toLowerCase()) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "in_progress":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "active":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-pink-100 text-pink-800 border-pink-300";
      case "closed":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "resolved":
        return "bg-teal-100 text-teal-800 border-teal-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getPriorityBadgeColor = (priority: string | null | undefined) => {
    if (!priority) return "bg-gray-50 text-gray-700 border-gray-200";
    switch (priority.toLowerCase()) {
      case "low":
        return "bg-green-50 text-green-700 border-green-200";
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "high":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleViewDetails = (caseId: number) => {
    navigate(`/cases/${caseId}`);
  };

  const handleContactLawyer = (lawyerId: number) => {
    navigate(`/messages/lawyer/${lawyerId}`);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">My Cases</h1>
        <p className="text-gray-600 mt-1">Manage and track all your legal cases</p>
      </div>

      {/* Statistics Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-12 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : statistics ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Briefcase className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{statistics.total_cases}</div>
                <div className="text-xs text-gray-600 mt-1">Total Cases</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{statistics.active_cases}</div>
                <div className="text-xs text-gray-600 mt-1">Active Cases</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{statistics.pending_cases}</div>
                <div className="text-xs text-gray-600 mt-1">Pending</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{statistics.closed_cases}</div>
                <div className="text-xs text-gray-600 mt-1">Closed</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{statistics.resolved_cases}</div>
                <div className="text-xs text-gray-600 mt-1">Resolved</div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by title, case number, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      {casesLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading cases...</p>
          </div>
        </div>
      ) : casesError ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900">Error Loading Cases</h3>
                <p className="text-sm text-red-700 mt-1">{casesError}</p>
                <Button onClick={loadCases} className="mt-3 bg-red-600 hover:bg-red-700">
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : cases.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">No cases found</h3>
              <p className="text-gray-600 mt-1">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your filters or search"
                  : "You don't have any cases yet"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {cases.map((caseItem) => (
            <Card key={caseItem.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                  {/* Left & Center Section - Main Content */}
                  <div className="md:col-span-2 p-6 border-r border-gray-200">
                    {/* Header: Title and Badges */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{caseItem.title}</h3>
                      <div className="flex gap-2 flex-shrink-0">
                        <Badge className={getStatusBadgeColor(caseItem.status)}>
                          {caseItem.status ? caseItem.status.replace("_", " ").charAt(0).toUpperCase() + caseItem.status.replace("_", " ").slice(1) : "Unknown"}
                        </Badge>
                        <Badge className={getPriorityBadgeColor(caseItem.priority)}>
                          {caseItem.priority ? caseItem.priority.charAt(0).toUpperCase() + caseItem.priority.slice(1) : "N/A"}
                        </Badge>
                      </div>
                    </div>

                    {/* Case Number and Category */}
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-mono font-medium text-gray-900">{caseItem.case_number}</span>
                      <span className="mx-2">•</span>
                      <span className="text-gray-900">{caseItem.category}</span>
                    </p>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{caseItem.description}</p>

                    {/* Case Progress Section */}
                    {caseItem.case_progress !== undefined && caseItem.case_progress !== null && (
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium text-gray-900">Case Progress</h4>
                          <span className="text-sm font-semibold text-gray-900">
                            {Math.round(caseItem.case_progress)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.round(caseItem.case_progress)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        {/* Lawyer */}
                        {caseItem.lawyer && (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-4 h-4 text-gray-600" />
                              <span className="text-xs font-medium text-gray-600">Lawyer</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">{caseItem.lawyer.name}</p>
                          </div>
                        )}

                        {/* Next Hearing */}
                        {caseItem.hearing_date && (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="w-4 h-4 text-gray-600" />
                              <span className="text-xs font-medium text-gray-600">Next Hearing</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">{formatDate(caseItem.hearing_date)}</p>
                          </div>
                        )}

                        {/* Documents and Updates */}
                        <div className="flex gap-4">
                          <div>
                            <span className="text-xs font-medium text-gray-600">Documents</span>
                            <p className="text-sm font-medium text-gray-900">{caseItem.documents_count}</p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-600">Updates</span>
                            <p className="text-sm font-medium text-gray-900">{caseItem.updates_count}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        {/* Court */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="w-4 h-4 text-gray-600" />
                            <span className="text-xs font-medium text-gray-600">Court</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{caseItem.court_name || "Not Assigned"}</p>
                        </div>

                        {/* Last Updated */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-gray-600" />
                            <span className="text-xs font-medium text-gray-600">Last Updated</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{formatDate(caseItem.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar - Actions and Info */}
                  <div className="bg-gradient-to-b from-blue-50 to-white p-6 space-y-4">
                    {/* Legal Fees */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-2">Legal Fees</h4>
                      {caseItem.legal_fees_amount && caseItem.legal_fees_amount > 0 ? (
                        <div className="text-sm">
                          <div className="font-bold text-gray-900">
                            {formatCurrency(caseItem.legal_fees_paid || 0)}
                          </div>
                          <div className="text-xs text-gray-600">
                            / {formatCurrency(caseItem.legal_fees_amount)}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${((caseItem.legal_fees_paid || 0) / caseItem.legal_fees_amount) * 100}%`,
                              }}
                            />
                          </div>
                          <div className="text-xs text-blue-600 font-medium mt-1">
                            ₹{caseItem.legal_fees_amount - (caseItem.legal_fees_paid || 0)} pending
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">No fee information available</p>
                      )}
                    </div>

                    {/* Upcoming Hearing */}
                    {caseItem.hearing_date ? (
                      <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h5 className="text-xs font-semibold text-yellow-900">Upcoming Hearing</h5>
                            <p className="text-sm font-medium text-yellow-900 mt-1">{formatDate(caseItem.hearing_date)}</p>
                            {caseItem.court_name && (
                              <p className="text-xs text-yellow-700">{caseItem.court_name}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* Estimated Completion */}
                    {caseItem.estimated_completion_date && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-600 mb-2">Estimated Completion</h4>
                        <p className="text-sm font-medium text-gray-900">{formatDate(caseItem.estimated_completion_date)}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <Button
                        onClick={() => handleViewDetails(caseItem.id)}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium"
                      >
                        View Full Details
                      </Button>
                      <Button
                        onClick={() => handleContactLawyer(caseItem.lawyer_id)}
                        variant="outline"
                        className="w-full"
                      >
                        Contact Lawyer
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!casesLoading && cases.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            variant="outline"
          >
            Previous
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => setCurrentPage(page)}
                variant={currentPage === page ? "default" : "outline"}
                className="w-10"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            variant="outline"
          >
            Next
          </Button>

          <span className="text-sm text-gray-600 ml-4">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}
    </div>
  );
}
