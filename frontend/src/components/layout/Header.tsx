import { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, SlidersHorizontal, X, ChevronDown, Menu } from 'lucide-react';
import { useMailStore } from '../../store/mailStore';

const Header = () => {
  const { currentView, selectedEmailId, searchQuery, setSearchQuery, clearSearch, filters, setFilters, emails, searchResults, userProfile, login, logout } = useMailStore();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const advRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const [advFrom, setAdvFrom] = useState('');
  const [advTo, setAdvTo] = useState('');
  const [advSubject, setAdvSubject] = useState('');
  const [advDate, setAdvDate] = useState('Any time');
  const [advStatus, setAdvStatus] = useState('All');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (advRef.current && !advRef.current.contains(event.target as Node)) {
        setShowAdvanced(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdvancedSearch = () => {
    const parts = [];
    if (advFrom) parts.push(`from:${advFrom}`);
    if (advTo) parts.push(`to:${advTo}`);
    if (advSubject) parts.push(`subject:${advSubject}`);
    if (advStatus === 'Unread') parts.push('is:unread');
    
    if (advDate !== 'Any time') {
      const d = new Date();
      if (advDate === 'Today') d.setDate(d.getDate() - 1);
      else if (advDate === '7 days') d.setDate(d.getDate() - 7);
      else if (advDate === '30 days') d.setDate(d.getDate() - 30);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      parts.push(`after:${yyyy}/${mm}/${dd}`);
    }

    setSearchQuery(parts.join(' '));
    setShowAdvanced(false);
  };

  const handleClearAdvanced = () => {
    setAdvFrom('');
    setAdvTo('');
    setAdvSubject('');
    setAdvDate('Any time');
    setAdvStatus('All');
  };

  const getSearchChips = () => {
    if (!searchQuery) return [];
    const regex = /(from:|to:|subject:|is:|after:|before:)([^\s]+)/gi;
    let match;
    const chips = [];
    let remaining = searchQuery;
    while ((match = regex.exec(searchQuery)) !== null) {
      chips.push({ key: match[1].replace(':', ''), value: match[2], raw: match[0] });
      remaining = remaining.replace(match[0], '');
    }
    const remStr = remaining.trim();
    if (remStr) {
      chips.push({ key: 'search', value: remStr, raw: remStr });
    }
    return chips;
  };

  const removeChip = (rawChip: string) => {
    const newQuery = searchQuery.replace(rawChip, '').replace(/\s+/g, ' ').trim();
    setSearchQuery(newQuery);
  };

  const chips = getSearchChips();
  const isSearchActive = currentView === 'search';

  const viewEmails = isSearchActive ? searchResults : emails.filter((e: any) => e.folder === currentView);
  const totalCount = viewEmails.length;
  const unreadCount = viewEmails.filter((e: any) => !e.isRead).length;

  return (
    <header className="bg-white border-b border-gmail-border flex flex-col px-4 shrink-0 py-2 relative z-10">
      <div className="flex items-center justify-between w-full h-12">
        <div className="flex items-center w-64 shrink-0 gap-4">
          {!selectedEmailId && (
            <div className="text-xs text-gmail-textMuted font-medium flex items-center">
              {totalCount === 0 ? (
                "No messages"
              ) : (
                <>
                  {isSearchActive ? `${totalCount} emails found` : `Showing ${totalCount} email${totalCount !== 1 ? 's' : ''}`}
                </>
              )}
            </div>
          )}
        </div>
        
        {!selectedEmailId && (
          <div className="flex-1 flex items-center justify-center max-w-3xl px-4">
            <div className="relative w-full flex items-center bg-gmail-bg rounded-full px-2">
              <div className="p-2 text-gmail-textMuted">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full py-3 bg-transparent text-gmail-text placeholder-gmail-textMuted focus:outline-none text-base"
                placeholder="Search mail"
              />
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="p-2 rounded-full hover:bg-gray-200 text-gmail-textMuted transition-colors"
                title="Show search options"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            </div>
            
            {showAdvanced && (
              <div ref={advRef} className="absolute top-full left-4 right-4 mt-2 bg-white border border-gmail-border rounded-lg shadow-lg z-50 p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-gmail-textMuted mb-2">From</label>
                    <input type="text" value={advFrom} onChange={(e) => setAdvFrom(e.target.value)} className="w-full bg-white border-b border-gmail-border py-1 text-sm text-gmail-text focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gmail-textMuted mb-2">To</label>
                    <input type="text" value={advTo} onChange={(e) => setAdvTo(e.target.value)} className="w-full bg-white border-b border-gmail-border py-1 text-sm text-gmail-text focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-gmail-textMuted mb-2">Subject</label>
                    <input type="text" value={advSubject} onChange={(e) => setAdvSubject(e.target.value)} className="w-full bg-white border-b border-gmail-border py-1 text-sm text-gmail-text focus:outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={handleClearAdvanced} className="px-4 py-2 text-sm text-gmail-textMuted hover:bg-gray-100 rounded">
                    Clear
                  </button>
                  <button onClick={handleAdvancedSearch} className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700">
                    Search
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {selectedEmailId && <div className="flex-1"></div>}
        
        <div className="flex items-center gap-2 shrink-0">
          <button className="p-2 text-gmail-textMuted hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          <div className="relative" ref={accountRef}>
            <button 
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium text-sm overflow-hidden">
                {userProfile?.picture ? (
                  <img src={userProfile.picture} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  userProfile?.name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />
                )}
              </div>
            </button>
            
            {showAccountMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gmail-border rounded-2xl shadow-lg z-50 overflow-hidden flex flex-col p-2">
                <div className="p-4 flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium text-2xl overflow-hidden">
                    {userProfile?.picture ? (
                      <img src={userProfile.picture} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      userProfile?.name?.charAt(0).toUpperCase() || <User className="h-8 w-8" />
                    )}
                  </div>
                  <div className="flex flex-col items-center min-w-0">
                    <span className="text-base text-gmail-text truncate">Hi, {userProfile?.name || 'User'}!</span>
                    <span className="text-sm text-gmail-textMuted truncate">{userProfile?.email || ''}</span>
                  </div>
                  <button className="mt-3 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50">
                    Manage your Google Account
                  </button>
                </div>
                <div className="border-t border-gray-100 my-2"></div>
                <div className="p-2 flex justify-center">
                  <button 
                    onClick={() => { setShowAccountMenu(false); logout(); }}
                    className="px-6 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 border border-gray-300"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {!selectedEmailId && (
        <div className="flex items-center gap-2 mt-2 px-2 overflow-x-auto">
          {isSearchActive ? (
            <>
              {chips.map((chip, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-sm text-gmail-text border border-gray-200">
                  <span className="capitalize">{chip.key}:</span>
                  <span>{chip.value}</span>
                  <button onClick={() => removeChip(chip.raw)} className="p-0.5 hover:bg-gray-200 rounded-full ml-1">
                    <X className="w-3 h-3 text-gmail-textMuted" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => clearSearch()}
                className="px-2 py-1 text-sm text-blue-600 hover:underline"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setFilters({ unreadOnly: false })}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${!filters.unreadOnly ? 'bg-gmail-active text-blue-800' : 'bg-transparent text-gmail-textMuted hover:bg-gray-100'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilters({ unreadOnly: true })}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filters.unreadOnly ? 'bg-gmail-active text-blue-800' : 'bg-transparent text-gmail-textMuted hover:bg-gray-100'}`}
              >
                Unread
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
