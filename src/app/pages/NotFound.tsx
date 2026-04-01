import { Link } from "react-router";
import { AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
      <h2 className="text-3xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  );
}
