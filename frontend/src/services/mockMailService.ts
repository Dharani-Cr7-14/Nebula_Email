import type { Email } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const generateMockEmails = (): Email[] => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  return [
    {
      id: uuidv4(),
      sender: 'Sarah Jenkins',
      senderEmail: 'sarah.jenkins@example.com',
      recipient: 'me@nebulamail.ai',
      subject: 'Project Update: Q3 Deliverables',
      preview: 'Hi team, I just wanted to share a quick update on our Q3 deliverables...',
      body: 'Hi team,\n\nI just wanted to share a quick update on our Q3 deliverables. We are currently on track for the release next week. The frontend foundation is solid, and the backend API is ready for integration.\n\nPlease review the attached document (link) and let me know if you have any questions.\n\nBest,\nSarah',
      date: new Date(now - 1000 * 60 * 30).toISOString(), // 30 mins ago
      timestamp: now - 1000 * 60 * 30,
      isRead: false,
      folder: 'inbox',
    },
    {
      id: uuidv4(),
      sender: 'David Chen',
      senderEmail: 'david.c@example.com',
      recipient: 'me@nebulamail.ai',
      subject: 'Meeting Tomorrow',
      preview: 'Can we push our 10 AM meeting to 11 AM? I have a conflict...',
      body: 'Hey,\n\nCan we push our 10 AM meeting to 11 AM? I have a conflict with the marketing team sync.\n\nLet me know if that works for you.\n\nThanks,\nDavid',
      date: new Date(now - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      timestamp: now - 1000 * 60 * 60 * 2,
      isRead: false,
      folder: 'inbox',
    },
    {
      id: uuidv4(),
      sender: 'Me',
      senderEmail: 'me@nebulamail.ai',
      recipient: 'engineering-team@example.com',
      subject: 'Architecture Review Notes',
      preview: 'Here are the notes from yesterday\'s architecture review session.',
      body: 'Hi everyone,\n\nHere are the notes from yesterday\'s architecture review session. We agreed to move forward with the Zustand + Next.js (or Vite + FastAPI) stack depending on the specific product requirements.\n\nPlease add your comments to the Notion doc before Friday.\n\nCheers,\nMe',
      date: new Date(now - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      timestamp: now - 1000 * 60 * 60 * 24,
      isRead: true,
      folder: 'sent',
    },
    {
      id: uuidv4(),
      sender: 'HR Department',
      senderEmail: 'hr@example.com',
      recipient: 'me@nebulamail.ai',
      subject: 'Action Required: Open Enrollment',
      preview: 'This is a reminder that open enrollment for benefits ends on Friday.',
      body: 'Hello,\n\nThis is a reminder that open enrollment for benefits ends on Friday at 5:00 PM EST. Please log into the HR portal to review and update your selections.\n\nIf you do not make any changes, your current benefits will roll over.\n\nThank you,\nHR',
      date: new Date(now - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      timestamp: now - 1000 * 60 * 60 * 48,
      isRead: true,
      folder: 'inbox',
    },
    {
      id: uuidv4(),
      sender: 'GitHub',
      senderEmail: 'noreply@github.com',
      recipient: 'me@nebulamail.ai',
      subject: '[NebulaMail/core] Pull Request #42: Fix authentication flow',
      preview: 'Alex has requested your review on Pull Request #42.',
      body: 'Alex has requested your review on Pull Request #42.\n\n"I fixed the issue where the OAuth token would expire without automatically refreshing. PTAL."\n\nView it on GitHub: https://github.com/nebulamail/core/pull/42',
      date: new Date(now - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
      timestamp: now - 1000 * 60 * 60 * 72,
      isRead: true,
      folder: 'inbox',
    },
    {
      id: uuidv4(),
      sender: 'Me',
      senderEmail: 'me@nebulamail.ai',
      recipient: 'sarah.jenkins@example.com',
      subject: 'Re: Project Update: Q3 Deliverables',
      preview: 'Thanks Sarah. The foundation looks great. I will review the API docs today.',
      body: 'Thanks Sarah. The foundation looks great. I will review the API docs today and let you know if I need any changes on the backend.\n\nBest,\nMe',
      date: new Date(now - day * 4).toISOString(),
      timestamp: now - day * 4,
      isRead: true,
      folder: 'sent',
    },
    {
      id: uuidv4(),
      sender: 'Marketing Team',
      senderEmail: 'marketing@example.com',
      recipient: 'me@nebulamail.ai',
      subject: 'Newsletter Draft Review',
      preview: 'Please review the draft for next week\'s product newsletter.',
      body: 'Hi there,\n\nWe have prepared the draft for the upcoming product newsletter announcing the new AI assistant feature. We need engineering to verify the technical details mentioned in the second paragraph.\n\nPlease let us know by EOD.\n\nThanks!',
      date: new Date(now - day * 5).toISOString(),
      timestamp: now - day * 5,
      isRead: false,
      folder: 'inbox',
    },
    {
      id: uuidv4(),
      sender: 'Elena Rodriguez',
      senderEmail: 'elena.r@example.com',
      recipient: 'me@nebulamail.ai',
      subject: 'Coffee chat?',
      preview: 'Are you free for a quick coffee chat later this week? I\'d love to catch up.',
      body: 'Hey!\n\nIt\'s been a while since we caught up. Are you free for a quick coffee chat later this week? I\'d love to hear how the new project is going and pick your brain on some React architecture stuff.\n\nLet me know what days work for you.\n\nBest,\nElena',
      date: new Date(now - day * 6).toISOString(),
      timestamp: now - day * 6,
      isRead: true,
      folder: 'inbox',
    }
  ];
};
