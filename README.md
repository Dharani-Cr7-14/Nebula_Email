# NebulaMail AI

A full-stack, AI-powered web email client that connects to real Gmail accounts via Google OAuth and is controlled through natural language using Google Gemini with structured function calling.

---

## Demo Access

> This is a dedicated demo account created only for evaluating NebulaMail AI.

**Demo Gmail:** nebulamail.demo@gmail.com  
**Password:** Nebula@123

### How to test

1. Open NebulaMail AI (`http://localhost:5173` with both servers running).
2. Click **"Continue with Google"**.
3. Sign in using the demo Gmail account above.
4. Complete Google's normal verification if prompted.
5. Grant the requested Gmail permissions.
6. Test Inbox, Sent, Search, Compose, Reply, Send, AI Search, and AI Load More.

---

## Overview

NebulaMail AI is a Gmail-connected email client with a built-in AI copilot. Users can manage their email — read, compose, reply, search, and navigate — entirely through natural language commands. The AI understands intent, selects the appropriate action, and directly controls the application UI and state.

The AI works through a structured function-calling loop: the user's request is sent to Gemini, which returns a tool call, the frontend executes it against real Gmail, and the result is fed back to Gemini for the next step — until the task is complete.

---

## Core Features

### Email
- **Google OAuth login** — real Gmail accounts via OAuth 2.0
- **Live Syncing** — silent 10-second background polling ensures new emails arrive automatically
- **Classic UI** — clean, professional interface inspired by classic Gmail design
- **Inbox** — paginated Gmail Inbox with Load More
- **Sent Mail** — paginated Gmail Sent with Load More
- **Compose** — full compose window with To, Subject, Body; sends via Gmail API
- **Email Detail** — full email view with HTML rendering
- **Reply** — pre-filled reply compose window
- **Mark Read / Unread** — persisted directly to Gmail (survives page reload)
- **Search** — real Gmail search using Gmail search syntax (from:, subject:, is:unread, etc.)
- **Advanced Search** — structured search form for From, To, Subject, Date, Status
- **Pagination** — Gmail API nextPageToken-based pagination for Inbox, Sent, and Search results
- **Account Menu** — user profile display, Sign Out, Add Another Account

### AI Assistant
- **Natural language commands** — the AI understands plain English instructions
- **Gemini function calling** — structured tool/action execution (not prompt injection)
- **Multi-step AI workflows** — the AI executes sequences of actions to complete complex tasks
- **Hidden internal steps** — the user only sees a clean working indicator and the final result
- **Quick Actions** — preset prompts for common tasks

---

## AI Actions (Function Calling)

| Action | Description |
|---|---|
| `open_compose` | Opens the compose window |
| `fill_compose` | Fills the compose window with to/subject/body |
| `send_email` | Sends an email via Gmail API |
| `search_emails` | Searches Gmail and updates the main email list |
| `filter_emails` | Applies unread/sender filters |
| `open_email` | Opens a specific email by Gmail message ID |
| `navigate_to_inbox` | Navigates to Inbox |
| `navigate_to_sent` | Navigates to Sent |
| `start_reply` | Opens a reply to the specified or currently open email |
| `load_more_emails` | Loads the next page of emails for the current view (Inbox/Sent/Search) |

---

## Example AI Commands

```
Find emails from john@example.com
Find the email with subject "Quick hello", reply saying "Thanks!", and send it.
Load more emails
Compose an email to jane@example.com about the meeting tomorrow
Reply to the current email saying I'll get back to you soon
Go to Sent
Go to Inbox
Find unread emails
Show me emails from the last 7 days
```

---

## Architecture

```
User → NebulaMail AI Interface
         ↓
     AI Assistant Panel (Gemini)
         ↓
     Structured Tool Call
         ↓
     Frontend Action Layer (aiActionService.ts)
         ↓
     Zustand Application State (mailStore.ts)
         ↓
     HTTP Request (gmailMailService.ts)
         ↓
     FastAPI Backend (Python)
         ↓
     Gmail API / Gemini API
         ↓
     Real Gmail Account
```

**Key design decisions:**
- Search results are stored in a dedicated `searchResults` state, keeping Inbox and Sent caches untouched
- `currentView` transitions to `'search'` when a search is active
- Pagination uses Gmail's `nextPageToken` — the same store functions are used by both the manual Load More button and the AI `load_more_emails` action
- The AI multi-step loop passes full tool result history back to Gemini on each iteration so it can chain actions
- OAuth tokens are stored server-side in a signed, HttpOnly JWT cookie — never exposed to frontend JavaScript

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Backend Framework | Python FastAPI |
| Gmail Integration | Google Gmail API v1 |
| Authentication | Google OAuth 2.0 |
| AI | Google Gemini (gemini-3.6-flash) with function calling |
| Session Security | PyJWT (HS256, HttpOnly cookie) |

---

## Project Structure

```
NEBULAMAIL-AI/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/
│   │   │   │   └── AssistantPanel.tsx   # AI chat + multi-step loop
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx           # Search, account menu
│   │   │   │   ├── MainLayout.tsx       # 3-column layout
│   │   │   │   └── Sidebar.tsx          # Navigation
│   │   │   └── mail/
│   │   │       ├── Compose.tsx          # Compose modal
│   │   │       ├── EmailDetail.tsx      # Email reader
│   │   │       ├── EmailList.tsx        # Email list view
│   │   │       └── EmailListItem.tsx    # Single email row
│   │   ├── pages/
│   │   │   └── Login.tsx               # OAuth login page
│   │   ├── services/
│   │   │   ├── aiActionService.ts      # AI tool implementations
│   │   │   ├── gmailMailService.ts     # Gmail API HTTP client
│   │   │   └── mockMailService.ts      # Mock data fallback
│   │   ├── store/
│   │   │   └── mailStore.ts            # Zustand global state
│   │   └── types/
│   │       └── index.ts                # Shared TypeScript types
│   └── package.json
│
└── backend/
    ├── app/
    │   ├── api/
    │   │   ├── auth.py                 # OAuth routes
    │   │   ├── mail.py                 # Gmail mail routes
    │   │   └── ai.py                   # Gemini AI route
    │   ├── core/
    │   │   └── config.py               # Pydantic settings
    │   ├── schemas/
    │   │   ├── auth.py                 # Auth response models
    │   │   └── mail.py                 # Email/pagination models
    │   ├── services/
    │   │   ├── ai_service.py           # Gemini client + tool declarations
    │   │   ├── auth_service.py         # JWT session management
    │   │   └── gmail_service.py        # Gmail API client
    │   └── main.py                     # FastAPI app + CORS
    └── requirements.txt
```

---

## Local Setup

### Prerequisites
- Node.js v18+
- Python 3.10+
- A Google Cloud project with Gmail API enabled and OAuth credentials configured

### 1. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create a project
2. Enable **Gmail API** under APIs & Services → Library
3. Configure **OAuth Consent Screen** (External), add scopes:
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.modify`
4. Add your email as a **Test User**
5. Create **OAuth Client ID** → Web Application:
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:8000/api/auth/google/callback`
6. Get a [Gemini API key](https://ai.dev/) from Google AI Studio

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then fill in your values
uvicorn app.main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Environment Variables

Create `backend/.env` with the following variables. **Never commit this file.**

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret from Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | Must match your OAuth config: `http://localhost:8000/api/auth/google/callback` |
| `GEMINI_API_KEY` | API key from Google AI Studio |
| `JWT_SECRET` | A long random secret for signing session JWTs |
| `FRONTEND_URL` | The frontend origin: `http://localhost:5173` |

> **Security:** All secrets are loaded server-side only via `python-dotenv` / `pydantic-settings`. The frontend never receives credentials. OAuth tokens are stored in a signed, HttpOnly cookie.

---

## Security Notes

- OAuth tokens are **never** sent to the frontend
- The session is stored in a signed **HttpOnly cookie** (inaccessible to JavaScript)
- `backend/.env` is listed in `.gitignore` and must never be committed
- The Gemini API key is loaded server-side only via the backend environment
- All Gmail API calls are made server-to-server (backend → Gmail API)
- PKCE state is stored in a short-lived HttpOnly cookie to prevent CSRF during OAuth
