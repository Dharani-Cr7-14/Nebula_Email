import { Mail, Send, PenSquare, Sparkles, Star, FileText, Trash2, Search, Edit3, Reply, Loader2 } from 'lucide-react';
import { useMailStore } from '../../store/mailStore';

const Sidebar = () => {
  const { currentView, openInbox, openSent, openCompose, emails, loadingViews } = useMailStore();
  
  const unreadCount = emails.filter((e: any) => e.folder === 'inbox' && !e.isRead).length;
  
  const isAnyLoading = Object.values(loadingViews).some(Boolean);

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">
      <div className="p-4 font-bold text-xl text-violet-400 flex items-center justify-between border-b border-slate-800 bg-slate-950">
        <div className="flex items-center gap-2">
          <Mail className="w-6 h-6" />
          <div className="flex flex-col">
            <span className="leading-none">NebulaMail AI</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">AI-Controlled Workspace</span>
          </div>
        </div>
        {isAnyLoading && <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />}
      </div>
      
      <div className="p-4">
        <button 
          onClick={() => openCompose()}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-violet-900/20"
        >
          <PenSquare className="w-5 h-5" />
          Compose
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        <button
          onClick={openInbox}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-colors ${
            currentView === 'inbox' 
              ? 'bg-violet-500/10 text-violet-300 font-medium' 
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5" />
            Inbox
          </div>
          {unreadCount > 0 && (
            <span className="bg-violet-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>



        <button
          onClick={openSent}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
            currentView === 'sent' 
              ? 'bg-violet-500/10 text-violet-300 font-medium' 
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          <Send className="w-5 h-5" />
          Sent
        </button>



        <div className="pt-4 mt-2 border-t border-slate-800/50">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">AI Tools</h3>
          <div className="space-y-1">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('ai-quick-prompt', { detail: { prompt: 'Summarize my recent emails.', autoSubmit: true } }))}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              Summarize emails
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('ai-quick-prompt', { detail: { prompt: 'Find all my unread emails.', autoSubmit: true } }))}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <Search className="w-4 h-4 text-violet-400" />
              Find unread
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('ai-quick-prompt', { detail: { prompt: 'Draft an email to ', autoSubmit: false } }))}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <Edit3 className="w-4 h-4 text-violet-400" />
              Draft email
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('ai-quick-prompt', { detail: { prompt: 'Reply to the current email saying ', autoSubmit: false } }))}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <Reply className="w-4 h-4 text-violet-400" />
              Reply to email
            </button>
          </div>
        </div>
      </nav>
      
      <div className="p-4 border-t border-slate-800 bg-slate-950 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-300 tracking-wide">NebulaMail AI</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Copilot Ready
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
