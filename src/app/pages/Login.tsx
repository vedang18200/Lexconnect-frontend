import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Scale, ChevronRight } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [selectedRole, setSelectedRole] = useState<'citizen' | 'lawyer' | 'social-worker' | null>(null);

  const handleLogin = async () => {
    setLocalError("");

    if (!username || !password) {
      setLocalError("Please enter your credentials");
      return;
    }

    if (!selectedRole) {
      setLocalError("Please select a portal");
      return;
    }

    try {
      await login(username, password, selectedRole);

      // Navigate based on role
      if (selectedRole === 'citizen') {
        navigate('/');
      } else if (selectedRole === 'lawyer') {
        navigate('/lawyer-dashboard');
      } else if (selectedRole === 'social-worker') {
        navigate('/social-worker-dashboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setLocalError(errorMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedRole) {
      handleLogin();
    }
  };

  // Show portal selector
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">Lexconnect</h1>
            <p className="text-gray-600 mt-2">Legal Services Platform</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Select Your Portal</CardTitle>
              <CardDescription>Choose your role to continue to the login page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Citizen Portal */}
                <button
                  onClick={() => setSelectedRole('citizen')}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">Citizen</h3>
                  <p className="text-sm text-gray-600 mb-4">Find legal help and consultations</p>
                  <div className="flex items-center text-blue-600">
                    <span className="text-sm font-medium">Continue</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </button>

                {/* Lawyer Portal */}
                <button
                  onClick={() => setSelectedRole('lawyer')}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">Lawyer</h3>
                  <p className="text-sm text-gray-600 mb-4">Manage your legal practice</p>
                  <div className="flex items-center text-blue-600">
                    <span className="text-sm font-medium">Continue</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </button>

                {/* Social Worker Portal */}
                <button
                  onClick={() => setSelectedRole('social-worker')}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">Social Worker</h3>
                  <p className="text-sm text-gray-600 mb-4">Manage referrals and cases</p>
                  <div className="flex items-center text-blue-600">
                    <span className="text-sm font-medium">Continue</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Register here
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show login form after role selection
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">Lexconnect</h1>
          <p className="text-gray-600 mt-2">
            {selectedRole === 'citizen' && 'Citizen Portal'}
            {selectedRole === 'lawyer' && 'Lawyer Portal'}
            {selectedRole === 'social-worker' && 'Social Worker Portal'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login to Your Account</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(error || localError) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error || localError}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Email or Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="your@email.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                autoComplete="username"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSelectedRole(null);
                setUsername("");
                setPassword("");
                setLocalError("");
              }}
              disabled={isLoading}
            >
              Back to Portal Selection
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Register here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
