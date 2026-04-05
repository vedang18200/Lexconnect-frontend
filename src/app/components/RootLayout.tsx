import { useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import type { UserResponse } from "../services/types";
import { Scale, LayoutDashboard, User, Calendar, Briefcase, Search, MessageSquare, CreditCard, Users, UserPlus, FolderOpen, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface RootLayoutProps {
  user: (UserResponse & { user_id: number; user_type: 'citizen' | 'lawyer' | 'social-worker' }) | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

export function RootLayout({ user, isAuthenticated, isLoading, logout }: RootLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth check to complete before redirecting
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading state while checking authentication
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const userRole = user.user_type;
  const displayName = user.username || user.email || 'User';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((namePart) => namePart[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const citizenNav = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/find-lawyers", label: "Find Lawyers", icon: Search },
    { path: "/my-cases", label: "My Cases", icon: Briefcase },
    { path: "/my-consultations", label: "Consultations", icon: Calendar },
    { path: "/messages", label: "Messages", icon: MessageSquare },
    { path: "/citizen-profile", label: "Profile", icon: User },
  ];

  const lawyerNav = [
    { path: "/lawyer-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/lawyer-cases", label: "Cases", icon: Briefcase },
    { path: "/lawyer-clients", label: "Clients", icon: Users },
    { path: "/lawyer-calendar", label: "Calendar", icon: Calendar },
    { path: "/lawyer-billing", label: "Billing", icon: CreditCard },
    { path: "/lawyer-messages", label: "Messages", icon: MessageSquare },
    { path: "/lawyer-profile", label: "Profile", icon: User },
  ];

  const socialWorkerNav = [
    { path: "/social-worker-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/referrals", label: "New Referral", icon: UserPlus },
    { path: "/referral-cases", label: "My Referrals", icon: FolderOpen },
    { path: "/lawyer-directory", label: "Lawyer Directory", icon: Search },
    { path: "/social-worker-messages", label: "Messages", icon: MessageSquare },
    { path: "/social-worker-profile", label: "Profile", icon: User },
  ];

  const navItems = userRole === 'citizen' ? citizenNav : userRole === 'lawyer' ? lawyerNav : socialWorkerNav;

  const getRoleName = () => {
    if (userRole === 'citizen') return 'Citizen Portal';
    if (userRole === 'lawyer') return 'Lawyer Portal';
    return 'Social Worker Portal';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">Lexconnect</h1>
                <p className="text-sm text-gray-500">{getRoleName()}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Avatar>
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
