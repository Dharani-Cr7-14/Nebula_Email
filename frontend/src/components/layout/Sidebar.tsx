import { Mail, Send, Sparkles, Search, Edit3, Reply, Loader2, Menu, Plus } from 'lucide-react';
import { useMailStore } from '../../store/mailStore';
import { cn } from '../../utils/cn';

const Sidebar = () => {
  const { currentView, openInbox, openSent, openCompose, emails, loadingViews, isSidebarCollapsed, toggleSidebar } = useMailStore();
  
  const unreadCount = emails.filter((e: any) => e.folder === 'inbox' && !e.isRead).length;
  
  const isAnyLoading = Object.values(loadingViews).some(Boolean);

  return (
    <div className={cn("bg-gmail-bg flex flex-col h-full shrink-0 relative z-20 transition-all duration-300", isSidebarCollapsed ? "w-[72px]" : "w-[256px]")}>
      <div className="px-4 py-3 flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-3 -ml-3 rounded-full hover:bg-gray-200 text-gmail-textMuted transition-colors flex-shrink-0">
          <Menu className="w-5 h-5" />
        </button>
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded flex items-center justify-center bg-red-500 text-white shadow-sm flex-shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <span className="text-xl font-normal text-gray-700 tracking-tight truncate">NebulaMail</span>
          </div>
        )}
      </div>
      
      <div className={cn("pt-2 pb-4", isSidebarCollapsed ? "px-2 flex justify-center" : "px-3")}>
        <button 
          onClick={() => openCompose()}
          className={cn(
            "bg-[#c2e7ff] hover:bg-[#b3d4ec] text-[#001d35] font-medium rounded-2xl flex items-center transition-all duration-200 shadow-sm",
            isSidebarCollapsed ? "w-12 h-12 justify-center" : "py-4 px-6 gap-4 text-sm"
          )}
          title="Compose"
        >
          <div className="flex items-center justify-center bg-white rounded-md shadow-sm p-1">
            <Plus className="w-4 h-4 text-gray-600" />
          </div>
          {!isSidebarCollapsed && <span className="pr-2">Compose</span>}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-0.5 pr-3">
        <button
          onClick={openInbox}
          className={cn(
            "flex items-center transition-all text-sm font-medium rounded-r-full",
            isSidebarCollapsed ? "w-12 h-10 ml-2 justify-center rounded-full" : "w-full justify-between px-6 py-2",
            currentView === 'inbox' 
              ? 'bg-gmail-active text-gmail-activeText font-bold' 
              : 'text-gmail-text hover:bg-gray-200'
          )}
          title="Inbox"
        >
          <div className={cn("flex items-center", isSidebarCollapsed ? "" : "gap-4")}>
            <Mail className={cn("w-4 h-4", currentView === 'inbox' ? 'text-blue-700' : 'text-gmail-textMuted')} />
            {!isSidebarCollapsed && "Inbox"}
          </div>
          {!isSidebarCollapsed && unreadCount > 0 && (
            <span className={cn("text-xs font-bold", currentView === 'inbox' ? 'text-gmail-activeText' : 'text-gmail-text')}>
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={openSent}
          className={cn(
            "flex items-center transition-all text-sm font-medium rounded-r-full",
            isSidebarCollapsed ? "w-12 h-10 ml-2 justify-center rounded-full mt-0.5" : "w-full gap-4 px-6 py-2 mt-0.5",
            currentView === 'sent' 
              ? 'bg-gmail-active text-gmail-activeText font-bold' 
              : 'text-gmail-text hover:bg-gray-200'
          )}
          title="Sent"
        >
          <Send className={cn("w-4 h-4 flex-shrink-0", currentView === 'sent' ? 'text-blue-700' : 'text-gmail-textMuted')} />
          {!isSidebarCollapsed && "Sent"}
        </button>

        <div className="mt-4 pt-4 border-t border-gray-200">
          {!isSidebarCollapsed && <div className="px-6 mb-2 text-xs font-semibold text-gmail-textMuted uppercase tracking-wider">AI Tools</div>}
          
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('ai-quick-prompt', { detail: { prompt: 'Summarize my recent emails.', autoSubmit: true } }))}
            className={cn(
              "flex items-center text-sm font-medium text-gmail-text hover:bg-gray-200 transition-all rounded-r-full",
              isSidebarCollapsed ? "w-12 h-10 ml-2 justify-center rounded-full mt-1" : "w-full gap-4 px-6 py-2 mt-1"
            )}
            title="Summarize emails"
          >
            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
            {!isSidebarCollapsed && "Summarize emails"}
          </button>
          
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('ai-quick-prompt', { detail: { prompt: 'Find all my unread emails.', autoSubmit: true } }))}
            className={cn(
              "flex items-center text-sm font-medium text-gmail-text hover:bg-gray-200 transition-all rounded-r-full",
              isSidebarCollapsed ? "w-12 h-10 ml-2 justify-center rounded-full mt-1" : "w-full gap-4 px-6 py-2 mt-1"
            )}
            title="Find unread"
          >
            <Search className="w-4 h-4 text-blue-600 flex-shrink-0" />
            {!isSidebarCollapsed && "Find unread"}
          </button>
          
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('ai-quick-prompt', { detail: { prompt: 'Draft an email to ', autoSubmit: false } }))}
            className={cn(
              "flex items-center text-sm font-medium text-gmail-text hover:bg-gray-200 transition-all rounded-r-full",
              isSidebarCollapsed ? "w-12 h-10 ml-2 justify-center rounded-full mt-1" : "w-full gap-4 px-6 py-2 mt-1"
            )}
            title="Draft email"
          >
            <Edit3 className="w-4 h-4 text-blue-600 flex-shrink-0" />
            {!isSidebarCollapsed && "Draft email"}
          </button>
          
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('ai-quick-prompt', { detail: { prompt: 'Reply to the current email saying ', autoSubmit: false } }))}
            className={cn(
              "flex items-center text-sm font-medium text-gmail-text hover:bg-gray-200 transition-all rounded-r-full",
              isSidebarCollapsed ? "w-12 h-10 ml-2 justify-center rounded-full mt-1" : "w-full gap-4 px-6 py-2 mt-1"
            )}
            title="Reply to email"
          >
            <Reply className="w-4 h-4 text-blue-600 flex-shrink-0" />
            {!isSidebarCollapsed && "Reply to email"}
          </button>
        </div>
      </nav>
      
      <div className={cn("border-t border-gray-200 mt-auto bg-gmail-bg flex items-center", isSidebarCollapsed ? "p-3 justify-center" : "p-4")}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0" title="NebulaMail AI is Ready">
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          {!isSidebarCollapsed && (
            <div className="overflow-hidden">
              <div className="text-sm font-medium text-gray-700 truncate">NebulaMail AI</div>
              <div className="text-xs text-green-600 font-medium truncate">
                Ready
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
