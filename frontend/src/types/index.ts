export interface Email {
  id: string;
  threadId?: string;
  sender: string;
  senderEmail: string;
  recipient: string;
  subject: string;
  preview: string;
  body: string;
  htmlBody?: string;
  date: string;
  timestamp: number;
  isRead: boolean;
  folder: 'inbox' | 'sent' | 'search';
}

export interface ComposeDraft {
  to: string;
  subject: string;
  body: string;
}

export interface MailFilters {
  unreadOnly: boolean;
  sender?: string;
}

export interface PaginatedEmails {
  emails: Email[];
  nextPageToken: string | null;
}

export interface AIToolResponse {
  success: boolean;
  message: string;
  data?: any;
}
