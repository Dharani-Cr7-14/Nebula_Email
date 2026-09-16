import type { Email, ComposeDraft, PaginatedEmails } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class GmailMailService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Important to send cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('UNAUTHORIZED');
      }
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async checkAuth() {
    return this.request<{ is_authenticated: boolean, email: string, name: string, picture?: string }>('/api/auth/me');
  }
  
  async loginUrl() {
    return this.request<{ url: string }>('/api/auth/login');
  }
  
  async logout() {
    return this.request<{ status: string }>('/api/auth/logout', { method: 'POST' });
  }

  async getEmail(id: string): Promise<Email> {
    return this.request<Email>(`/api/mail/messages/${id}`);
  }

  async getInbox(pageToken?: string): Promise<PaginatedEmails> {
    const url = pageToken ? `/api/mail/inbox?pageToken=${pageToken}` : '/api/mail/inbox';
    return this.request<PaginatedEmails>(url);
  }

  async getSent(pageToken?: string): Promise<PaginatedEmails> {
    const url = pageToken ? `/api/mail/sent?pageToken=${pageToken}` : '/api/mail/sent';
    return this.request<PaginatedEmails>(url);
  }

  async searchMessages(query: string, pageToken?: string): Promise<PaginatedEmails> {
    let url = `/api/mail/search?q=${encodeURIComponent(query)}`;
    if (pageToken) url += `&pageToken=${pageToken}`;
    return this.request<PaginatedEmails>(url);
  }

  async sendEmail(draft: ComposeDraft): Promise<{ status: string, id: string }> {
    return this.request<{ status: string, id: string }>('/api/mail/send', {
      method: 'POST',
      body: JSON.stringify({
        to: draft.to,
        subject: draft.subject,
        body: draft.body
      })
    });
  }

  async markAsRead(id: string): Promise<{ status: string, isRead: boolean }> {
    return this.request<{ status: string, isRead: boolean }>(`/api/mail/messages/${id}/read`, { method: 'POST' });
  }

  async markAsUnread(id: string): Promise<{ status: string, isRead: boolean }> {
    return this.request<{ status: string, isRead: boolean }>(`/api/mail/messages/${id}/unread`, { method: 'POST' });
  }
}

export const gmailMailService = new GmailMailService();
