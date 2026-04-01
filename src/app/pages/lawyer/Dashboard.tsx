import { Card, CardContent } from "../../components/ui/card";
import { Users, Briefcase, Calendar, IndianRupee } from "lucide-react";

export function LawyerDashboard() {
  const stats = [
    { label: "Active Clients", value: 24, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Cases", value: 18, icon: Briefcase, color: "text-green-600", bg: "bg-green-50" },
    { label: "Consultations Today", value: 3, icon: Calendar, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Earnings (Month)", value: "₹1,25,000", icon: IndianRupee, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900">Lawyer Dashboard</h2>
        <p className="text-gray-600 mt-1">Welcome back! Here's your practice overview</p>
      </div>

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
    </div>
  );
}
