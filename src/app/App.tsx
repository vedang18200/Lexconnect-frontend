import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import './utils/debugAuth'; // Initialize debug utilities

function AppWithRouter() {
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppWithRouter />
    </AuthProvider>
  );
}
