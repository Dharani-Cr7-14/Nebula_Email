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
    <div className="flex flex-col h-full bg-white">
      {viewEmails.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          {isCurrentViewLoading ? (
            <div className="flex flex-col items-center gap-4 text-gmail-textMuted">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm font-medium">Loading emails...</p>
            </div>
          ) : (
            <>
              <div className="text-center max-w-sm px-4">
                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <div className="w-10 h-10 border-4 border-gray-300 rounded-lg"></div>
                </div>
                <h3 className="text-lg font-medium text-gmail-text mb-2">Nothing to see here</h3>
                {currentView === 'search' ? (
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-gmail-textMuted mb-6">
                      No emails match your search for "{searchQuery}".
                    </p>
                    <button 
                      onClick={() => clearSearch()}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                    >
                      Clear Search
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gmail-textMuted">Your {currentView} looks clean.</p>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-gray-100 overflow-y-auto">
          {viewEmails.map(email => (
            <div key={email.id}>
              <EmailListItem 
                email={email} 
                onClick={() => openEmail(email.id)}
                isSentView={currentView === 'sent'}
              />
            </div>
          ))}
          
          {/* Load More Indicator */}
          {nextToken ? (
            <div className="p-4 flex justify-center border-t border-gray-100">
              <button 
                onClick={handleLoadMore}
                disabled={isCurrentViewLoading}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-gmail-textMuted hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              >
                {isCurrentViewLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    Loading more...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          ) : (
            viewEmails.length > 0 && !isCurrentViewLoading && (
              <div className="p-6 text-center">
                <p className="text-xs text-gmail-textMuted font-medium">No more emails to load</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default EmailList;
