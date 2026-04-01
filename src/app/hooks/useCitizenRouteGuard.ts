import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to protect citizen-only routes.
 * Ensures only authenticated users with 'citizen' role can access the route.
 * Redirects to login if user is not authenticated or has wrong role.
 */
export function useCitizenRouteGuard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      // Not authenticated, redirect to login
      navigate('/login');
      return;
    }

    const userRole = user.user_type?.toLowerCase();

    if (userRole === 'lawyer') {
      // Wrong role - redirect to lawyer dashboard
      navigate('/lawyer-dashboard');
    } else if (userRole === 'social-worker') {
      // Wrong role - redirect to social worker dashboard
      navigate('/social-worker-dashboard');
    } else if (userRole !== 'citizen') {
      // Unknown role, redirect to login
      navigate('/login');
    }
  }, [user, navigate]);

  // Return whether the user is authorized
  return user?.user_type?.toLowerCase() === 'citizen';
}
