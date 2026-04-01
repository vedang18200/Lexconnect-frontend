import { Card, CardContent } from "../../components/ui/card";
import { UserPlus, FolderOpen, Users, TrendingUp } from "lucide-react";

export function SocialWorkerDashboard() {
  const stats = [
    { label: "Total Referrals", value: 48, icon: UserPlus, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Cases", value: 12, icon: FolderOpen, color: "text-green-600", bg: "bg-green-50" },
    { label: "Clients Helped", value: 156, icon: Users, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Success Rate", value: "89%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900">Social Worker Dashboard</h2>
        <p className="text-gray-600 mt-1">Track your referrals and client outcomes</p>
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
