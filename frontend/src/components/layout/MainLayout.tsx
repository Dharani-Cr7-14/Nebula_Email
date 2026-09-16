import Sidebar from './Sidebar';
import Header from './Header';
import AssistantPanel from '../ai/AssistantPanel';
import EmailList from '../mail/EmailList';
import EmailDetail from '../mail/EmailDetail';
import Compose from '../mail/Compose';
import { useMailStore } from '../../store/mailStore';

const MainLayout = () => {
  const { selectedEmailId } = useMailStore();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-hidden m-4 bg-slate-900 rounded-xl shadow-inner border border-slate-800">
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
