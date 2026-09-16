import Sidebar from './Sidebar';
import Header from './Header';
import AssistantPanel from '../ai/AssistantPanel';
import EmailList from '../mail/EmailList';
import EmailDetail from '../mail/EmailDetail';
import Compose from '../mail/Compose';
import { useEffect } from 'react';
import { useMailStore } from '../../store/mailStore';

const MainLayout = () => {
  const { selectedEmailId, fetchEmails, isAuthenticated, currentView } = useMailStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Poll for new emails silently every 10 seconds
    const intervalId = setInterval(() => {
      // Only fetch silently for the current view if it's inbox or sent
      if (currentView === 'inbox' || currentView === 'sent') {
        fetchEmails(currentView, undefined, true);
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchEmails, currentView]);

  return (
    <div className="flex h-screen overflow-hidden bg-gmail-bg text-gmail-text font-sans selection:bg-blue-100 selection:text-blue-900">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden relative bg-white border-l border-r border-gray-200">
        <Header />
        
        <main className="flex-1 overflow-hidden relative bg-white">
          {selectedEmailId ? <EmailDetail /> : <EmailList />}
        </main>
        
        {/* Compose floats over the main area */}
        <Compose />
      </div>
      
      <AssistantPanel />
    </div>
  );
};

export default MainLayout;
