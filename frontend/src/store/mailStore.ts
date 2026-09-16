import { create } from 'zustand';
import type { Email, ComposeDraft, MailFilters } from '../types';
import { generateMockEmails } from '../services/mockMailService';
import { gmailMailService } from '../services/gmailMailService';
import { v4 as uuidv4 } from 'uuid';

interface MailState {
  // Auth State
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  userProfile: { email: string; name: string; picture?: string } | null;
  useMockData: boolean;

  // Data
  emails: Email[];
  searchResults: Email[];
  loadingViews: Record<string, boolean>;
  pageTokens: Record<string, string | null>;
  
  // UI State
  currentView: 'inbox' | 'sent' | 'search';
  selectedEmailId: string | null;
  searchQuery: string;
  filters: MailFilters;
  
  // Compose State
  composeOpen: boolean;
  composeDraft: ComposeDraft;

  // Auth Actions
  initAuth: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Data Actions
  fetchEmails: (forceView?: 'inbox' | 'sent', pageToken?: string) => Promise<void>;

  // UI Actions
  openInbox: () => void;
  openSent: () => void;
  openEmail: (id: string) => Promise<void>;
  closeEmail: () => void;
  openCompose: (initialData?: Partial<ComposeDraft>) => void;
  closeCompose: () => void;
  updateComposeDraft: (data: Partial<ComposeDraft>) => void;
  sendEmailAction: () => Promise<void>;
  setSearchQuery: (query: string, pageToken?: string) => Promise<Email[]>;
  clearSearch: () => void;
  setFilters: (filters: Partial<MailFilters>) => void;
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
}

const emptyDraft: ComposeDraft = { to: '', subject: '', body: '' };

export const useMailStore = create<MailState>((set, get) => ({
  isAuthenticated: false,
  isAuthLoading: true,
  authError: null,
  userProfile: null,
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',

  emails: [],
  searchResults: [],
  loadingViews: {},
  pageTokens: {},
  
  currentView: 'inbox',
  selectedEmailId: null,
  searchQuery: '',
  filters: { unreadOnly: false },
  
  composeOpen: false,
  composeDraft: emptyDraft,

  initAuth: async () => {
    set({ isAuthLoading: true, authError: null });
    if (get().useMockData) {
      // Mock flow
      set({ isAuthenticated: true, userProfile: { email: 'me@nebulamail.ai', name: 'Me' }, isAuthLoading: false, emails: generateMockEmails() });
      return;
    }
    
    try {
      const result = await gmailMailService.checkAuth();
      if (result.is_authenticated) {
        set({ isAuthenticated: true, userProfile: { email: result.email, name: result.name, picture: result.picture }, isAuthLoading: false });
        get().fetchEmails('inbox');
        get().fetchEmails('sent');
      } else {
        set({ isAuthenticated: false, isAuthLoading: false });
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      set({ isAuthenticated: false, isAuthLoading: false });
    }
  },

  login: async () => {
    try {
      set({ authError: null });
      const result = await gmailMailService.loginUrl();
      window.location.href = result.url; // Redirect to Google OAuth
    } catch (err: any) {
      set({ authError: "Failed to initialize login. Is the backend running and configured?" });
    }
  },
  
  logout: async () => {
    if (!get().useMockData) {
      await gmailMailService.logout();
    }
    set({ 
      isAuthenticated: false, 
      userProfile: null, 
      emails: [],
      pageTokens: {},
      loadingViews: {},
      selectedEmailId: null,
      currentView: 'inbox',
      searchQuery: '',
      composeOpen: false
    });
  },

  fetchEmails: async (forceView?: 'inbox' | 'sent', pageToken?: string) => {
    if (get().useMockData) return;
    const view = forceView || get().currentView;
    set(state => ({ loadingViews: { ...state.loadingViews, [view]: true } }));
    
    try {
      const fetched = view === 'inbox' ? await gmailMailService.getInbox(pageToken) : await gmailMailService.getSent(pageToken);
      
      set((state) => {
        const otherEmails = state.emails.filter(e => e.folder !== view);
        let existingViewEmails = pageToken ? state.emails.filter(e => e.folder === view) : [];
        
        // Preserve any previously loaded full body content for emails that appear in the newly fetched list
        const updatedFetched = fetched.emails.map(newEmail => {
          const existing = state.emails.find(e => e.id === newEmail.id);
          if (existing && (existing.htmlBody || existing.body)) {
            return { ...newEmail, htmlBody: existing.htmlBody, body: existing.body };
          }
          return newEmail;
        });
        
        // Deduplicate
        const mergedViewEmails = [...existingViewEmails];
        for (const email of updatedFetched) {
           if (!mergedViewEmails.find(e => e.id === email.id)) {
              mergedViewEmails.push(email);
           }
        }
        
        return { 
          emails: [...otherEmails, ...mergedViewEmails],
          loadingViews: { ...state.loadingViews, [view]: false },
          pageTokens: { ...state.pageTokens, [view]: fetched.nextPageToken || null }
        };
      });
    } catch (err) {
      console.error(`Failed to fetch emails for ${view}`, err);
      set(state => ({ loadingViews: { ...state.loadingViews, [view]: false } }));
    }
  },

  openInbox: () => {
    set({ currentView: 'inbox', selectedEmailId: null, searchQuery: '', searchResults: [] });
    get().fetchEmails('inbox');
  },
  
  openSent: () => {
    set({ currentView: 'sent', selectedEmailId: null, searchQuery: '', searchResults: [] });
    get().fetchEmails('sent');
  },
  
  openEmail: async (id: string) => {
    set({ selectedEmailId: id });
    get().markAsRead(id);
    
    if (!get().useMockData) {
      try {
        // Look for email in all sources: inbox/sent emails AND search results
        const allEmails = [...get().emails, ...get().searchResults];
        const existingEmail = allEmails.find(e => e.id === id);
        // If we already have the full body content, skip the fetch
        if (existingEmail && (existingEmail.htmlBody || (existingEmail.body && existingEmail.body.length > 500))) {
          return;
        }
        
        const fullEmail = await gmailMailService.getEmail(id);
        // Update in both emails array and searchResults
        set((state) => ({
          emails: state.emails.map(e => e.id === id ? { ...e, ...fullEmail, isRead: true } : e),
          searchResults: state.searchResults.map(e => e.id === id ? { ...e, ...fullEmail, isRead: true } : e)
        }));
      } catch (err) {
        console.error("Failed to fetch full email", err);
      }
    }
  },
  
  closeEmail: () => set({ selectedEmailId: null }),
  
  openCompose: (initialData) => set({ 
    composeOpen: true, 
    composeDraft: { ...emptyDraft, ...initialData } 
  }),
  
  closeCompose: () => set({ composeOpen: false, composeDraft: emptyDraft }),
  
  updateComposeDraft: (data) => set((state) => ({
    composeDraft: { ...state.composeDraft, ...data }
  })),
  
  sendEmailAction: async () => {
    const { composeDraft, emails, useMockData } = get();
    if (!composeDraft.to) return; 
    
    if (useMockData) {
      const newEmail: Email = {
        id: uuidv4(),
        sender: 'Me',
        senderEmail: 'me@nebulamail.ai',
        recipient: composeDraft.to,
        subject: composeDraft.subject || '(No Subject)',
        preview: composeDraft.body.substring(0, 50) + (composeDraft.body.length > 50 ? '...' : ''),
        body: composeDraft.body,
        date: new Date().toISOString(),
        timestamp: Date.now(),
        isRead: true,
        folder: 'sent',
      };
      
      set({ 
        emails: [newEmail, ...emails],
        composeOpen: false,
        composeDraft: emptyDraft
      });
    } else {
      try {
        await gmailMailService.sendEmail(composeDraft);
        set({ composeOpen: false, composeDraft: emptyDraft });
        if (get().currentView === 'sent') {
          get().fetchEmails('sent');
        }
      } catch (err) {
        console.error("Failed to send email", err);
        alert("Failed to send email.");
      }
    }
  },
  
  setSearchQuery: async (query: string, pageToken?: string) => {
    set({ searchQuery: query });
    if (!get().useMockData && query.length > 2) {
      set(state => ({ loadingViews: { ...state.loadingViews, search: true }, currentView: 'search' }));
      try {
        const result = await gmailMailService.searchMessages(query, pageToken);
        const searchEmails = result.emails.map(e => ({ ...e, folder: 'search' as const }));

        if (pageToken) {
          // Append to existing search results for pagination
          set(state => ({
            searchResults: [...state.searchResults, ...searchEmails.filter(ne => !state.searchResults.find(e => e.id === ne.id))],
            loadingViews: { ...state.loadingViews, search: false },
            pageTokens: { ...state.pageTokens, search: result.nextPageToken || null }
          }));
        } else {
          // Fresh search — replace search results
          set(state => ({
            searchResults: searchEmails,
            loadingViews: { ...state.loadingViews, search: false },
            pageTokens: { ...state.pageTokens, search: result.nextPageToken || null }
          }));
        }
        return result.emails;
      } catch (err) {
        console.error(err);
        set(state => ({ loadingViews: { ...state.loadingViews, search: false } }));
        return [];
      }
    } else if (query.length === 0) {
      get().clearSearch();
      return get().emails.filter(e => e.folder === 'inbox');
    }
    return [];
  },

  clearSearch: () => {
    set({ searchQuery: '', searchResults: [], currentView: 'inbox', pageTokens: { ...get().pageTokens, search: null } });
  },
  
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  
  markAsRead: async (id: string) => {
    // Optimistic update
    set((state) => ({
      emails: state.emails.map(email => 
        email.id === id ? { ...email, isRead: true } : email
      )
    }));
    if (!get().useMockData) {
      try {
        await gmailMailService.markAsRead(id);
      } catch (err) {
        console.error("Failed to mark as read", err);
        // Revert
        set((state) => ({
          emails: state.emails.map(email => 
            email.id === id ? { ...email, isRead: false } : email
          )
        }));
      }
    }
  },

  markAsUnread: async (id: string) => {
    // Optimistic update
    set((state) => ({
      emails: state.emails.map(email => 
        email.id === id ? { ...email, isRead: false } : email
      )
    }));
    if (!get().useMockData) {
      try {
        await gmailMailService.markAsUnread(id);
      } catch (err) {
        console.error("Failed to mark as unread", err);
        // Revert
        set((state) => ({
          emails: state.emails.map(email => 
            email.id === id ? { ...email, isRead: true } : email
          )
        }));
      }
    }
  },
}));
