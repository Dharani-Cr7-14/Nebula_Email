import { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
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

  let title = currentView === 'inbox' ? 'Inbox' : currentView === 'sent' ? 'Sent Mail' : `Search Results`;
  if (selectedEmailId) {
    title = 'Email Content';
  }
  if (isSearchActive && !selectedEmailId && searchQuery) {
    title = `Search: "${searchQuery}"`;
  }

  // Use the appropriate email list for counts
  const viewEmails = isSearchActive ? searchResults : emails.filter((e: any) => e.folder === currentView);
  const totalCount = viewEmails.length;
  const unreadCount = viewEmails.filter((e: any) => !e.isRead).length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 flex flex-col px-6 shrink-0 py-3 relative">
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col w-64 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-slate-100 capitalize uppercase tracking-wide">{title}</h1>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 whitespace-nowrap">GMAIL API</span>
          </div>
          {!selectedEmailId && (
            <div className="text-xs text-slate-400 mt-1 font-medium">
              {totalCount === 0 ? (
                "No messages"
              ) : (
                <>
                  {isSearchActive ? `${totalCount} emails found` : `Showing ${totalCount} email${totalCount !== 1 ? 's' : ''}`}
                  <span className="mx-1">•</span> {unreadCount} unread
                </>
              )}
            </div>
          )}
        </div>
        
        {!selectedEmailId && (
          <div className="flex-1 flex items-center max-w-2xl px-4 relative">
            <div className="relative w-full flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-9 pr-10 py-1.5 border border-slate-700 rounded-md leading-5 bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 sm:text-sm transition-colors shadow-inner"
                placeholder="Search sender, subject, body..."
              />
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`absolute right-1.5 p-1 rounded ${showAdvanced ? 'bg-violet-900/50 text-violet-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                title="Advanced Search"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>
            
            {showAdvanced && (
              <div ref={advRef} className="absolute top-full left-4 right-4 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 p-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Advanced Search</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">From</label>
                    <input type="text" value={advFrom} onChange={(e) => setAdvFrom(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">To</label>
                    <input type="text" value={advTo} onChange={(e) => setAdvTo(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Subject</label>
                    <input type="text" value={advSubject} onChange={(e) => setAdvSubject(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                    <div className="relative">
                      <select value={advDate} onChange={(e) => setAdvDate(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-200 appearance-none focus:outline-none focus:border-violet-500">
                        <option>Any time</option>
                        <option>Today</option>
                        <option>7 days</option>
                        <option>30 days</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                    <div className="relative">
                      <select value={advStatus} onChange={(e) => setAdvStatus(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-200 appearance-none focus:outline-none focus:border-violet-500">
                        <option>All</option>
                        <option>Unread</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 mb-4 bg-slate-800/30 p-2 rounded">
                  <span className="font-semibold block mb-1">Examples:</span>
                  <code className="text-violet-400">from:name@example.com</code>, <code className="text-violet-400">subject:invoice</code>, <code className="text-violet-400">is:unread</code>
                </div>

                <div className="flex justify-end gap-2">
                  <button onClick={handleClearAdvanced} className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors">
                    Clear
                  </button>
                  <button onClick={handleAdvancedSearch} className="px-4 py-1.5 text-sm font-medium bg-violet-600 text-white rounded-md hover:bg-violet-500 transition-colors shadow-lg shadow-violet-900/20">
                    Search
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {selectedEmailId && <div className="flex-1"></div>}
        
        <div className="flex items-center gap-4 shrink-0">
          <button className="p-2 text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-800 transition-colors">
            <Bell className="h-4 w-4" />
          </button>
          <div className="relative" ref={accountRef}>
            <button 
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-2 p-1 pr-2 border border-slate-700 rounded-full hover:bg-slate-800 transition-colors"
            >
              <div className="w-7 h-7 bg-violet-900/50 text-violet-400 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden">
                {userProfile?.picture ? (
                  <img src={userProfile.picture} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  userProfile?.name?.charAt(0).toUpperCase() || <User className="h-3.5 w-3.5" />
                )}
              </div>
              <span className="text-sm font-medium text-slate-300 max-w-[120px] truncate">{userProfile?.name || 'User'}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
            
            {showAccountMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-900/50 text-violet-400 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                    {userProfile?.picture ? (
                      <img src={userProfile.picture} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      userProfile?.name?.charAt(0).toUpperCase() || <User className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-200 truncate">{userProfile?.name || 'User'}</span>
                    <span className="text-xs text-slate-400 truncate">{userProfile?.email || ''}</span>
                  </div>
                </div>
                
                <div className="p-2 border-b border-slate-800">
                  <button className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-md transition-colors opacity-50 cursor-not-allowed">
                    Manage account
                  </button>
                </div>
                
                <div className="p-2 border-b border-slate-800">
                  <button 
                    onClick={() => { setShowAccountMenu(false); login(); }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-2"
                  >
                    <span className="text-lg leading-none">+</span> Add another account
                  </button>
                </div>
                
                <div className="p-2">
                  <button 
                    onClick={() => { setShowAccountMenu(false); logout(); }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-md transition-colors"
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
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
          {isSearchActive ? (
            <>
              {chips.map((chip, idx) => (
                <div key={idx} className="flex items-center gap-1.5 pl-2 pr-1 py-1 bg-violet-900/30 border border-violet-500/30 rounded-md text-xs font-medium text-violet-300">
                  <span className="capitalize text-slate-400">{chip.key}:</span>
                  <span>{chip.value}</span>
                  <button onClick={() => removeChip(chip.raw)} className="p-0.5 hover:bg-violet-500/20 rounded">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => clearSearch()}
                className="px-2 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Clear all
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setFilters({ unreadOnly: false })}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors border ${!filters.unreadOnly ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800/50'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilters({ unreadOnly: true })}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors border ${filters.unreadOnly ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800/50'}`}
              >
                Unread
              </button>
              <button 
                disabled
                className="px-3 py-1 text-xs font-medium rounded-full transition-colors border bg-transparent border-transparent text-slate-600 cursor-not-allowed"
              >
                Important
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
