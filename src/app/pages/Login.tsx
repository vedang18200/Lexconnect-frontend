import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Scale,
  ArrowRight,
  UserRound,
  Briefcase,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

type PortalRole = "citizen" | "lawyer";

const ROLE_CONFIG: Record<
  PortalRole,
  {
    title: string;
    subtitle: string;
    cardGradient: string;
    iconGradient: string;
    buttonGradient: string;
    accentText: string;
    focusRing: string;
    features: string[];
    icon: typeof UserRound;
  }
> = {
  citizen: {
    title: "Citizen",
    subtitle: "Find legal help and manage consultations",
    cardGradient: "from-blue-50/90 via-blue-50/60 to-indigo-50/80",
    iconGradient: "from-blue-600 to-indigo-600",
    buttonGradient: "from-blue-600 to-indigo-600",
    accentText: "text-blue-600",
    focusRing: "focus-visible:ring-blue-500/30 focus-visible:border-blue-500",
    features: ["Find qualified lawyers", "Track your cases", "Book consultations"],
    icon: UserRound,
  },
  lawyer: {
    title: "Lawyer",
    subtitle: "Manage your legal practice efficiently",
    cardGradient: "from-indigo-50/90 via-violet-50/60 to-purple-50/80",
    iconGradient: "from-indigo-600 to-purple-600",
    buttonGradient: "from-indigo-600 to-purple-600",
    accentText: "text-indigo-600",
    focusRing: "focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500",
    features: [
      "Manage clients & cases",
      "Schedule consultations",
      "Handle billing & payments",
    ],
    icon: Briefcase,
  },
};

export function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState("");
  const [selectedRole, setSelectedRole] = useState<PortalRole | null>(null);

  const handleLogin = async () => {
    setLocalError("");

    if (!username.trim() || !password.trim()) {
      setLocalError("Please enter your credentials");
      return;
    }

    if (!selectedRole) {
      setLocalError("Please select a portal");
      return;
    }

    try {
      await login(username.trim(), password.trim(), selectedRole);

      if (!rememberMe) {
        localStorage.removeItem("refreshToken");
      }

      // Navigate based on role
      if (selectedRole === 'citizen') {
        navigate('/');
      } else if (selectedRole === 'lawyer') {
        navigate('/lawyer-dashboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setLocalError(errorMessage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && selectedRole) {
      e.preventDefault();
      void handleLogin();
    }
  };

  const resetToRoleSelection = () => {
    setSelectedRole(null);
    setUsername("");
    setPassword("");
    setLocalError("");
  };

  const activeRole = selectedRole ? ROLE_CONFIG[selectedRole] : null;

  // Show portal selector
  if (!selectedRole) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 px-4 py-10 md:px-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="auth-blob auth-blob-one" />
          <div className="auth-blob auth-blob-two" />
          <div className="auth-blob auth-blob-three" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
          <div className="w-full max-w-4xl">
            <div className="auth-fade-in text-center mb-10 md:mb-12">
              <div className="auth-float inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-4 shadow-[0_16px_30px_-12px_rgba(37,99,235,0.6)]">
                <Scale className="h-10 w-10 text-white" />
              </div>
              <h1 className="mt-5 text-5xl font-semibold tracking-tight text-slate-900 md:text-6xl">
                LexConnect
              </h1>
              <p className="mt-2 text-lg text-slate-600 md:text-xl">Legal Services Platform</p>
            </div>

            <Card className="auth-slide-up overflow-hidden rounded-3xl border-white/60 bg-white/65 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.35)] backdrop-blur-xl">
              <CardContent className="p-5 md:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-semibold text-slate-900">Select Your Portal</h2>
                  <p className="mt-1 text-slate-600">Choose your role to continue to the login page</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {(Object.keys(ROLE_CONFIG) as PortalRole[]).map((role) => {
                    const config = ROLE_CONFIG[role];
                    const RoleIcon = config.icon;

                    return (
                      <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`group relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br ${config.cardGradient} p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_24px_45px_-20px_rgba(37,99,235,0.45)]`}
                      >
                        <div
                          className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${config.iconGradient} text-white shadow-lg`}
                        >
                          <RoleIcon className="h-7 w-7" />
                        </div>

                        <h3 className="mt-5 text-4xl font-semibold text-slate-900">{config.title}</h3>
                        <p className="mt-2 text-lg text-slate-600">{config.subtitle}</p>

                        <ul className="mt-5 space-y-2 text-base text-slate-700">
                          {config.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <div
                          className={`mt-6 inline-flex items-center gap-2 text-lg font-semibold ${config.accentText}`}
                        >
                          <span>Continue</span>
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-6 text-center text-sm text-slate-600">
                  Don&apos;t have an account?{" "}
                  <Link to="/register" className="font-semibold text-blue-600 hover:underline">
                    Register here
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <style>{`
          .auth-blob {
            position: absolute;
            border-radius: 9999px;
            filter: blur(26px);
            opacity: 0.35;
            animation: blobFloat 15s ease-in-out infinite;
          }

          .auth-blob-one {
            width: 22rem;
            height: 22rem;
            top: -6rem;
            left: -6rem;
            background: radial-gradient(circle at 30% 30%, #60a5fa, #3b82f6);
            animation-delay: 0s;
          }

          .auth-blob-two {
            width: 26rem;
            height: 26rem;
            right: -8rem;
            top: 12%;
            background: radial-gradient(circle at 40% 40%, #818cf8, #6366f1);
            animation-delay: 1.8s;
          }

          .auth-blob-three {
            width: 24rem;
            height: 24rem;
            left: 35%;
            bottom: -8rem;
            background: radial-gradient(circle at 35% 35%, #a78bfa, #8b5cf6);
            animation-delay: 3.4s;
          }

          .auth-float {
            animation: logoFloat 4.8s ease-in-out infinite;
          }

          .auth-fade-in {
            animation: fadeInUp 0.9s ease-out both;
          }

          .auth-slide-up {
            animation: slideUp 0.75s ease-out both;
          }

          @keyframes blobFloat {
            0%,
            100% {
              transform: translate3d(0, 0, 0) scale(1);
            }
            50% {
              transform: translate3d(0, -18px, 0) scale(1.06);
            }
          }

          @keyframes logoFloat {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-8px);
            }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(26px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  // Show login form after role selection
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 px-4 py-10 md:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="auth-blob auth-blob-one" />
        <div className="auth-blob auth-blob-two" />
        <div className="auth-blob auth-blob-three" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-xl items-center justify-center">
        <div className="w-full">
          <div className="auth-fade-in text-center mb-8">
            <div className={`auth-float inline-flex items-center justify-center rounded-2xl bg-gradient-to-br ${activeRole?.buttonGradient} p-4 shadow-[0_16px_30px_-12px_rgba(37,99,235,0.55)]`}>
              <Scale className="h-10 w-10 text-white" />
            </div>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight text-slate-900">LexConnect</h1>
            <p className="mt-2 text-lg text-slate-600">{activeRole?.title} Portal</p>
          </div>

          <Card className="auth-slide-up overflow-hidden rounded-3xl border-white/60 bg-white/70 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            <CardContent className="space-y-4 p-6 md:p-8">
              <button
                type="button"
                onClick={resetToRoleSelection}
                disabled={isLoading}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to role selection
              </button>

              <div>
                <h2 className="text-3xl font-semibold text-slate-900">Login to Your Account</h2>
                <p className="mt-1 text-slate-600">Enter your credentials to continue</p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-3 text-sm text-blue-700">
                <p className="inline-flex items-center gap-2 font-medium">
                  <ShieldCheck className="h-4 w-4" />
                  Demo mode enabled: use your valid credentials to test role-specific login.
                </p>
              </div>

              {(error || localError) && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error || localError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                  Email or Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="your@email.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="username"
                  disabled={isLoading}
                  className={`h-11 rounded-xl bg-white/90 ${activeRole?.focusRing ?? ""}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                  disabled={isLoading}
                  className={`h-11 rounded-xl bg-white/90 ${activeRole?.focusRing ?? ""}`}
                />
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="inline-flex items-center gap-2 text-slate-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Remember me
                </label>

                <a href="#" className="font-medium text-slate-600 hover:text-slate-900 hover:underline">
                  Forgot password?
                </a>
              </div>

              <Button
                className={`h-11 w-full rounded-xl bg-gradient-to-r ${activeRole?.buttonGradient} text-white hover:brightness-105`}
                onClick={() => void handleLogin()}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : `Login as ${activeRole?.title ?? "User"}`}
              </Button>

              <p className="text-center text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="font-semibold text-blue-600 hover:underline">
                  Register here
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        .auth-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(26px);
          opacity: 0.35;
          animation: blobFloat 15s ease-in-out infinite;
        }

        .auth-blob-one {
          width: 22rem;
          height: 22rem;
          top: -6rem;
          left: -6rem;
          background: radial-gradient(circle at 30% 30%, #60a5fa, #3b82f6);
          animation-delay: 0s;
        }

        .auth-blob-two {
          width: 26rem;
          height: 26rem;
          right: -8rem;
          top: 12%;
          background: radial-gradient(circle at 40% 40%, #818cf8, #6366f1);
          animation-delay: 1.8s;
        }

        .auth-blob-three {
          width: 24rem;
          height: 24rem;
          left: 35%;
          bottom: -8rem;
          background: radial-gradient(circle at 35% 35%, #a78bfa, #8b5cf6);
          animation-delay: 3.4s;
        }

        .auth-float {
          animation: logoFloat 4.8s ease-in-out infinite;
        }

        .auth-fade-in {
          animation: fadeInUp 0.9s ease-out both;
        }

        .auth-slide-up {
          animation: slideUp 0.75s ease-out both;
        }

        @keyframes blobFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(0, -18px, 0) scale(1.06);
          }
        }

        @keyframes logoFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(26px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
