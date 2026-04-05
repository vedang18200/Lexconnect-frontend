import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Briefcase, Calendar, MessageSquare, FileText, Clock } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState } from "react";

import { citizensAPI } from "../../services/api";
import { useCitizenRouteGuard } from "../../hooks/useCitizenRouteGuard";
import type { CitizenCaseSummary } from "../../services/types/citizenDashboard";
import type { CitizenConsultationsSummary } from "../../services/types/citizenConsultations";

// State for the stats API
type DashboardStats = {
  active_cases: number;
  upcoming_consultations: number;
  unread_messages: number;
  documents: number;
};

// Type for recent message activity
type RecentMessage = {
  from: string;
  message: string;
  time: string;
  timestamp: string;
};


// State for cases-summary API
// type CaseSummary = {
//   total_cases: number;
//   status_breakdown: Record<string, number>;
//   categiory_breakdown: Record<string, number>;
// }


export function CitizenDashboard() {
  // Protect route - only citizens can access
  useCitizenRouteGuard();

  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Consultations summary state
  const [consultSummary, setConsultSummary] =
    useState<CitizenConsultationsSummary | null>(null);
  const [consultLoading, setConsultLoading] = useState(true);
  const [consultError, setConsultError] = useState<string | null>(null);

  // Cases summary state
  const [cases, setCases] = useState<CitizenCaseSummary[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const [casesError, setCasesError] = useState<string | null>(null);

  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState<string | null>(null);


  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const res = (await citizensAPI.getDashboardStats()) as Partial<DashboardStats>;
        if (!mounted) return;
        setStatsData({
          active_cases: Number(res.active_cases ?? 0),
          upcoming_consultations: Number(res.upcoming_consultations ?? 0),
          unread_messages: Number(res.unread_messages ?? 0),
          documents: Number(res.documents ?? 0),
        });
      } catch (err) {
        if (!mounted) return;
        setStatsError(
          err instanceof Error ? err.message : "Failed to load dashboard stats"
        );
      } finally {
        if (mounted) setStatsLoading(false);
      }
    };

    const loadCases = async () => {
      setCasesLoading(true);
      setCasesError(null);
      try {
        const res = (await citizensAPI.getCasesSummary()) as CitizenCaseSummary[];
        if (!mounted) return;
        setCases(res);
      } catch (err) {
        if (!mounted) return;
        setCasesError(err instanceof Error ? err.message : "Failed to load cases");
      } finally {
        if (mounted) setCasesLoading(false);
      }
    };


    const loadConsultSummary = async () => {
      setConsultLoading(true);
      setConsultError(null);
      try {
        const res = (await citizensAPI.getConsultationsSummary()) as CitizenConsultationsSummary;
        if (!mounted) return;
        setConsultSummary(res);
      } catch (err) {
        if (!mounted) return;
        setConsultError(err instanceof Error ? err.message : "Failed to load consultations summary");
      } finally {
        if (mounted) setConsultLoading(false);
      }
    };

    const loadRecentMessages = async () => {
      setMessagesLoading(true);
      setMessagesError(null);
      try {
        // Fetch activity summary for the last 30 days
        const activityData = (await citizensAPI.getActivitySummary(30)) as any;
        if (!mounted) return;

        // Safely check if activities exist and is an array
        const activities = Array.isArray(activityData?.activities)
          ? activityData.activities
          : Array.isArray(activityData)
          ? activityData
          : [];

        if (activities.length === 0) {
          setRecentMessages([]);
          return;
        }

        // Convert activity items to recent messages format
        // Filter for message activities and take top 3
        const messageActivities = activities
          .filter((activity: any) => {
            // Check if activity has type field and it contains 'message'
            return activity?.type?.toLowerCase?.()?.includes?.('message') ||
                   activity?.description?.toLowerCase?.()?.includes?.('message');
          })
          .slice(0, 3)
          .map((activity: any) => {
            // Extract time difference from timestamp
            const timestamp = activity.timestamp || new Date().toISOString();
            const activityTime = new Date(timestamp);
            const now = new Date();
            const diffMs = now.getTime() - activityTime.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            let timeStr = 'just now';
            if (diffMins > 0 && diffHours === 0) {
              timeStr = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
            } else if (diffHours > 0 && diffDays === 0) {
              timeStr = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            } else if (diffDays > 0) {
              timeStr = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            }

            // Extract sender name from description
            const description = activity.description || '';
            const fromMatch = description.match(/from\s+(.+?)(?:\s+[-:]|$)/i);
            const senderName = fromMatch ? fromMatch[1] : 'Unknown User';

            return {
              from: senderName,
              message: description,
              time: timeStr,
              timestamp: timestamp
            };
          });

        setRecentMessages(messageActivities);
      } catch (err) {
        if (!mounted) return;
        console.error('Error loading recent messages:', err);
        setMessagesError(err instanceof Error ? err.message : "Failed to load recent messages");
        // Set default empty messages on error
        setRecentMessages([]);
      } finally {
        if (mounted) setMessagesLoading(false);
      }
    };

    loadStats();
    loadCases();
    loadConsultSummary();
    loadRecentMessages();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = [
    {
      label: "Active Cases",
      value: statsData?.active_cases ?? 0,
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Upcoming Consultations",
      value: statsData?.upcoming_consultations ?? 0,
      icon: Calendar,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Unread Messages",
      value: statsData?.unread_messages ?? 0,
      icon: MessageSquare,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Documents",
      value: statsData?.documents ?? 0,
      icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  // Dynamic data will be fetched from API - removed hardcoded data

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900">Welcome Back!</h2>
        <p className="text-gray-600 mt-1">Here's an overview of your legal matters</p>
        {statsLoading && <p className="text-sm text-gray-500 mt-1">Loading dashboard stats...</p>}
        {statsError && <p className="text-sm text-red-600 mt-1">{statsError}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-semibold mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Cases */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Active Cases
              </CardTitle>
              <Link to="/my-cases">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {casesLoading ? (
                <p className="text-sm text-gray-500">Loading cases...</p>
              ) : casesError ? (
                <p className="text-sm text-red-600">{casesError}</p>
              ) : cases.length === 0 ? (
                <p className="text-sm text-gray-500">No active cases found.</p>
              ) : (
                cases.map((case_) => (
                  <div key={case_.id} className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{case_.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{case_.description}</p>
                      </div>
                      <Badge className={case_.status === "active" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}>
                        {case_.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Lawyer: {case_.lawyer}
                      </span>
                      <span>•</span>
                      <span>Next Hearing: {case_.nextHearing ? case_.nextHearing : "N/A"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>


        {/* Consultations Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Consultations Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {consultLoading ? (
                <p className="text-sm text-gray-500">Loading consultations summary...</p>
              ) : consultError ? (
                <p className="text-sm text-red-600">{consultError}</p>
              ) : consultSummary ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Consultations:</span>
                    <span className="font-semibold">{consultSummary.total_consultations}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Fee Spent:</span>
                    <span className="font-semibold">₹{consultSummary.total_fee_spent}</span>
                  </div>
                  <div className="mt-2">
                    <span className="font-medium text-xs text-gray-700">Status Breakdown:</span>
                    {Object.keys(consultSummary.status_breakdown).length === 0 ? (
                      <div className="text-xs text-gray-500">No data</div>
                    ) : (
                      <ul className="text-xs ml-2 mt-1">
                        {Object.entries(consultSummary.status_breakdown).map(([status, count]) => (
                          <li key={status}>{status}: {count}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="font-medium text-xs text-gray-700">Type Breakdown:</span>
                    {Object.keys(consultSummary.type_breakdown).length === 0 ? (
                      <div className="text-xs text-gray-500">No data</div>
                    ) : (
                      <ul className="text-xs ml-2 mt-1">
                        {Object.entries(consultSummary.type_breakdown).map(([type, count]) => (
                          <li key={type}>{type}: {count}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Link to="/my-consultations">
                    <Button className="w-full mt-4" size="sm">View All Consultations</Button>
                  </Link>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Recent Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {messagesLoading ? (
                  <p className="text-sm text-gray-500">Loading recent messages...</p>
                ) : messagesError ? (
                  <p className="text-sm text-red-600">{messagesError}</p>
                ) : recentMessages.length === 0 ? (
                  <p className="text-sm text-gray-500">No recent messages.</p>
                ) : (
                  recentMessages.map((msg, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold shrink-0">
                        {msg.from.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{msg.from}</p>
                        <p className="text-xs text-gray-600 truncate">{msg.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{msg.time}</p>
                      </div>
                    </div>
                  ))
                )}
                <Link to="/messages" className="block mt-4">
                  <Button className="w-full" variant="outline" size="sm">View All Messages</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
