import { useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import { useMailStore } from './store/mailStore';

function App() {
  const { isAuthenticated, isAuthLoading, initAuth, login, authError } = useMailStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} error={authError} />;
  }

  return (
    <MainLayout />
  );
}

export default App;
