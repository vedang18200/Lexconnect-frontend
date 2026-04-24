import { Card, CardContent } from "../../components/ui/card";
import { Users, Briefcase, Calendar, IndianRupee } from "lucide-react";

export function LawyerDashboard() {

  // KPI stats
  const stats = [
    { label: "Active Clients", value: 24, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Cases", value: 18, icon: Briefcase, color: "text-green-600", bg: "bg-green-50" },
    { label: "Consultations Today", value: 3, icon: Calendar, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Earnings (Month)", value: "₹1,25,000", icon: IndianRupee, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  // Recent cases
  const recentCases = [
    { id: 1, title: "Property Dispute", client: "Rahul Sharma", status: "Open" },
    { id: 2, title: "Divorce Case", client: "Priya Mehta", status: "In Progress" },
    { id: 3, title: "Corporate Fraud", client: "Amit Verma", status: "Closed" },
  ];

  // Today's schedule
  const todaySchedule = [
    { id: 1, title: "Court Hearing", time: "10:30 AM" },
    { id: 2, title: "Client Meeting", time: "02:00 PM" },
    { id: 3, title: "Document Review", time: "05:00 PM" },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900">
          Lawyer Dashboard
        </h2>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's your practice overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-semibold mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Recent Cases */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-semibold">Recent Cases</h3>

            {recentCases.map((c) => (
              <div key={c.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-sm text-gray-500">{c.client}</p>
                </div>

                <span
                  className={`px-2 py-1 text-xs rounded ${
                    c.status === "Open"
                      ? "bg-green-100 text-green-700"
                      : c.status === "In Progress"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-semibold">Today's Schedule</h3>

            {todaySchedule.map((item) => (
              <div key={item.id} className="flex justify-between">
                <p className="text-gray-700">{item.title}</p>
                <span className="text-sm text-gray-500">
                  {item.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
