import { useMailStore } from '../../store/mailStore';
import EmailListItem from './EmailListItem';
import { Loader2 } from 'lucide-react';

const EmailList = () => {
  const { emails, searchResults, currentView, searchQuery, setSearchQuery, clearSearch, filters, openEmail, loadingViews, pageTokens } = useMailStore();

  // Determine which emails to display based on current view
  let viewEmails = [];
  if (currentView === 'search') {
    viewEmails = searchResults;
  } else {
    viewEmails = emails.filter((e: any) => e.folder === currentView);
  }

  // Apply unread filter on top
  if (filters.unreadOnly) {
    viewEmails = viewEmails.filter((e: any) => !e.isRead);
  }

  const isCurrentViewLoading = loadingViews[currentView];
  const nextToken = pageTokens[currentView];

  const handleLoadMore = () => {
    if (nextToken) {
      if (currentView === 'search') {
        setSearchQuery(searchQuery, nextToken);
      } else {
        useMailStore.getState().fetchEmails(currentView as 'inbox' | 'sent', nextToken);
      }
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-900 flex flex-col">
      {viewEmails.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
          {isCurrentViewLoading ? (
             <div className="w-full max-w-3xl flex flex-col gap-3">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className="w-full h-20 bg-slate-800/50 rounded-lg animate-pulse flex p-4 gap-4">
                   <div className="w-12 h-12 bg-slate-700/50 rounded-full shrink-0"></div>
                   <div className="flex-1 flex flex-col gap-2 justify-center">
                     <div className="w-1/4 h-4 bg-slate-700/50 rounded"></div>
                     <div className="w-1/2 h-3 bg-slate-700/50 rounded"></div>
                   </div>
                 </div>
               ))}
             </div>
          ) : (
            <>
              <div className="text-5xl mb-4 opacity-60">
                {currentView === 'search' ? '🔎' : '📭'}
              </div>
              <h3 className="text-lg font-medium text-slate-300 mb-1">
                {currentView === 'search' ? 'No emails found' : (filters.unreadOnly ? 'No unread emails here' : 'No emails here')}
              </h3>
              <div className="text-sm text-center text-slate-500 mt-2 max-w-md">
                {currentView === 'search' ? (
                  <div className="flex flex-col items-center gap-4 mt-1">
                    <span>Your search query didn't return any matches:</span>
                    <code className="px-3 py-1.5 bg-slate-800 rounded-md text-violet-300 text-xs break-all border border-slate-700 shadow-inner">
                      {searchQuery}
                    </code>
                    <button 
                      onClick={() => clearSearch()}
                      className="px-5 py-2 mt-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-700 shadow-sm"
                    >
                      Clear Search
                    </button>
                  </div>
                ) : (
                  `Your ${currentView} looks clean.`
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-800/50">
          {viewEmails.map(email => (
            <EmailListItem 
              key={email.id} 
              email={email} 
              onClick={() => openEmail(email.id)}
              isSentView={currentView === 'sent'}
            />
          ))}
          
          {nextToken && (
            <div className="p-4 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={isCurrentViewLoading}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-violet-300 text-sm font-medium rounded-lg transition-colors border border-slate-700 shadow-sm flex items-center gap-2"
              >
                {isCurrentViewLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading more emails...
                  </>
                ) : (
                  'Load more emails'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailList;
