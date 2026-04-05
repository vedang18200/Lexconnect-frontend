import { useAuth } from "../context/AuthContext";
import { RootLayout } from "./RootLayout";

/**
 * Wrapper component that ensures auth context is available before rendering RootLayout.
 * This component fetches auth state and conditionally renders either RootLayout or a loading/redirect state.
 */
export function RootLayoutWrapper() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();

  // Pass auth context to RootLayout as props instead of having it call useAuth directly
  return <RootLayout user={user} isAuthenticated={isAuthenticated} isLoading={isLoading} logout={logout} />;
}
