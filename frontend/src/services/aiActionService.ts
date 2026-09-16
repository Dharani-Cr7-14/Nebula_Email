import { useMailStore } from '../store/mailStore';
import type { MailFilters } from '../types';

export interface AIActionDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export const aiActions: AIActionDefinition[] = [
  {
    name: "open_compose",
    description: "Open the compose window",
    parameters: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "fill_compose",
    description: "Fill the currently open compose window with the supplied values",
    parameters: {
      type: "object",
      properties: {
        to: { type: "string" },
        subject: { type: "string" },
        body: { type: "string" }
      }
    }
  },
  {
    name: "send_email",
    description: "Send an actual email using the existing Gmail send functionality",
    parameters: {
      type: "object",
      properties: {
        to: { type: "string" },
        subject: { type: "string" },
        body: { type: "string" }
      },
      required: ["to", "subject", "body"]
    }
  },
  {
    name: "search_emails",
    description: "Search the user's emails using the existing search functionality and update the main mail area",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" }
      },
      required: ["query"]
    }
  },
  {
    name: "filter_emails",
    description: "Apply email filters through application state",
    parameters: {
      type: "object",
      properties: {
        unread: { type: "boolean" },
        after: { type: "string" },
        before: { type: "string" },
        sender: { type: "string" }
      }
    }
  },
  {
    name: "open_email",
    description: "Open the specified email in the main content area",
    parameters: {
      type: "object",
      properties: {
        email_id: { type: "string" }
      },
      required: ["email_id"]
    }
  },
  {
    name: "navigate_to_inbox",
    description: "Navigate to Inbox",
    parameters: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "navigate_to_sent",
    description: "Navigate to Sent",
    parameters: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "start_reply",
    description: "Start a reply to the specified email. If email_id is omitted, use the currently opened email.",
    parameters: {
      type: "object",
      properties: {
        email_id: { type: "string" }
      }
    }
  },
  {
    name: "load_more_emails",
    description: "Load the next page of emails for the current view (Inbox, Sent, or Search results). Appends to existing emails without replacing them. Use this when the user asks to see more emails or load more results.",
    parameters: {
      type: "object",
      properties: {}
    }
  }
];

export interface AIContext {
  currentView: 'inbox' | 'sent' | 'search';
  selectedEmailId: string | null;
  searchQuery: string;
  filters: MailFilters;
  composeOpen: boolean;
  composeDraft: { to: string; subject: string; body: string };
  isAuthenticated: boolean;
  userEmail: string | null;
}

export function getAIContext(): AIContext {
  const state = useMailStore.getState();
  return {
    currentView: state.currentView,
    selectedEmailId: state.selectedEmailId,
    searchQuery: state.searchQuery,
    filters: state.filters,
    composeOpen: state.composeOpen,
    composeDraft: state.composeDraft,
    isAuthenticated: state.isAuthenticated,
    userEmail: state.userProfile?.email || null
  };
}

export interface AIActionResult {
  success: boolean;
  action: string;
  data?: any;
  error?: string;
}

export async function executeAIAction(actionName: string, parameters: Record<string, any> = {}): Promise<AIActionResult> {
  const state = useMailStore.getState();
  const actionDef = aiActions.find(a => a.name === actionName);

  if (!actionDef) {
    return { success: false, action: actionName, error: `Unknown action: ${actionName}` };
  }

  // Parameter validation
  if (actionDef.parameters.required) {
    for (const req of (actionDef.parameters.required as string[])) {
      if (parameters[req] === undefined) {
        return { success: false, action: actionName, error: `Missing required parameter: ${req}` };
      }
    }
  }

  try {
    switch (actionName) {
      case "open_compose":
        state.openCompose();
        return { success: true, action: actionName };
        
      case "fill_compose":
        if (!state.composeOpen) {
          state.openCompose(); // Ensure it is open first
        }
        state.updateComposeDraft({
          to: parameters.to ?? state.composeDraft.to,
          subject: parameters.subject ?? state.composeDraft.subject,
          body: parameters.body ?? state.composeDraft.body,
        });
        return { 
          success: true, 
          action: actionName,
          data: { composeDraft: useMailStore.getState().composeDraft }
        };
        
      case "send_email":
        state.openCompose({
          to: parameters.to,
          subject: parameters.subject,
          body: parameters.body
        });
        await state.sendEmailAction();
        return { success: true, action: actionName };
        
      case "search_emails":
        const emails = await state.setSearchQuery(parameters.query);
        return { 
          success: true, 
          action: actionName,
          data: {
            count: emails.length,
            emails: emails.map(e => ({
              id: e.id,
              sender: e.sender,
              senderEmail: e.senderEmail,
              subject: e.subject,
              folder: e.folder
            }))
          }
        };
        
      case "filter_emails":
        state.setFilters({
          unreadOnly: parameters.unread !== undefined ? parameters.unread : state.filters.unreadOnly,
          sender: parameters.sender !== undefined ? parameters.sender : state.filters.sender
        });
        return { success: true, action: actionName };
        
      case "open_email":
        await state.openEmail(parameters.email_id);
        // Look in both emails array and searchResults
        const allEmails = [...useMailStore.getState().emails, ...useMailStore.getState().searchResults];
        const openedEmail = allEmails.find(e => e.id === parameters.email_id);
        return { 
          success: true, 
          action: actionName,
          data: openedEmail ? {
            id: openedEmail.id,
            subject: openedEmail.subject,
            sender: openedEmail.senderEmail,
            body: openedEmail.body
          } : null
        };
        
      case "navigate_to_inbox":
        state.openInbox();
        return { success: true, action: actionName };
        
      case "navigate_to_sent":
        state.openSent();
        return { success: true, action: actionName };

      case "load_more_emails": {
        const currentState = useMailStore.getState();
        const view = currentState.currentView;
        const nextToken = currentState.pageTokens[view];

        if (!nextToken) {
          // Count emails for the current view
          const currentCount = view === 'search'
            ? currentState.searchResults.length
            : currentState.emails.filter(e => e.folder === view).length;
          return {
            success: true,
            action: actionName,
            data: { addedCount: 0, totalCount: currentCount, hasMore: false }
          };
        }

        // Snapshot count before loading
        const countBefore = view === 'search'
          ? currentState.searchResults.length
          : currentState.emails.filter(e => e.folder === view).length;

        // Use the SAME functions as the manual Load More button
        if (view === 'search') {
          await useMailStore.getState().setSearchQuery(currentState.searchQuery, nextToken);
        } else {
          await useMailStore.getState().fetchEmails(view as 'inbox' | 'sent', nextToken);
        }

        // Count after loading
        const afterState = useMailStore.getState();
        const countAfter = view === 'search'
          ? afterState.searchResults.length
          : afterState.emails.filter(e => e.folder === view).length;
        const newNextToken = afterState.pageTokens[view];

        return {
          success: true,
          action: actionName,
          data: {
            addedCount: countAfter - countBefore,
            totalCount: countAfter,
            hasMore: !!newNextToken
          }
        };
      }
        
      case "start_reply":
        const targetEmailId = parameters.email_id || state.selectedEmailId;
        if (!targetEmailId) {
          return { success: false, action: actionName, error: "No email selected to reply to" };
        }
        
        // Search in both emails and searchResults
        const allAvailableEmails = [...state.emails, ...useMailStore.getState().searchResults];
        const email = allAvailableEmails.find(e => e.id === targetEmailId);
        if (!email) {
          return { success: false, action: actionName, error: "Email not found" };
        }
        
        state.openCompose({
          to: email.senderEmail,
          subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
          body: `\n\nOn ${email.date}, ${email.sender} wrote:\n> ${email.body.replace(/\n/g, '\n> ')}`
        });
        return { 
          success: true, 
          action: actionName,
          data: {
            reply_to: email.senderEmail,
            current_draft: useMailStore.getState().composeDraft
          }
        };
        
      default:
        return { success: false, action: actionName, error: "Action implemented but switch case missing" };
    }
  } catch (err: any) {
    return { success: false, action: actionName, error: err.message || String(err) };
  }
}
