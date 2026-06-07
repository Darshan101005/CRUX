# CRUX — Project Documentation & Workflow

Welcome to the **CRUX** project! This document serves as a comprehensive guide for developers to understand the project's purpose, architecture, tech stack, and internal workflows.

---

## 📌 1. What is CRUX?
CRUX is a unified **AI-powered intelligence dashboard** designed to connect to various communication platforms (Telegram, Gmail, Discord, Slack) and generate structured, actionable AI summaries of conversations. 

Currently, the primary implementation focuses on **Telegram**. Users can securely connect their Telegram account via MTProto, view their real chats, and use Google's Gemini AI to summarize messages, extract deadlines, and identify action items over specific time periods (Today, Yesterday, Past Week).

---

## 🛠️ 2. Tech Stack & Frameworks

### **Frontend**
- **Framework:** Angular (using modern features: Signals, Standalone Components, `inject()`)
- **Styling:** Tailwind CSS (with custom animations and glassmorphism UI)
- **Icons:** Google Material Icons
- **Key Architecture:**
  - Highly reactive state management using Angular `signal` and `computed`.
  - Service-oriented architecture (`TelegramService`, `AuthService`, `PlatformService`).

### **Backend**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (stores user accounts and secure session strings)
- **Telegram Integration:** MTProto protocol library (likely `telegram` / `gramjs`) for direct user-account access (not bot API).
- **AI Integration:** Google Generative AI (`gemini-2.5-flash`) via direct REST API calls.

---

## 🚀 3. Core Features & What We Have Built

### **Authentication & Onboarding**
- Users can sign up and log in (`auth.service.ts`).
- Accounts are stored in the PostgreSQL database.
- JWT tokens are used for API authorization.

### **Telegram Integration (MTProto)**
- Users connect to Telegram securely using their phone number and OTP (and 2FA if enabled).
- The session string is saved to the PostgreSQL database, so the user stays connected across sessions.
- **Auto-Detection:** When the dashboard loads, the backend checks if a valid Telegram session exists in the DB.

### **Dashboard UI (`dashboard.ts`)**
- Displays a list of real Telegram chats (Users, Groups, Channels) with live unread counts.
- **Search & Filter:** Users can search through their chats.
- **Pagination:** Loads 20 chats at a time with a "Load More" button.
- **Quick Stats:** Shows total chats, unread messages, and generated summaries.

### **AI Summarization Workflow**
- Users can summarize **All Chats** or a **Specific Chat**.
- **Time Periods:** Today, Yesterday, or Past Week.
- The backend fetches the raw messages for that period, formats them, and sends them to the **Gemini 2.5 Flash** API.
- The AI responds with structured JSON containing:
  1. **Overview:** A summary paragraph.
  2. **Important Messages:** Key messages with `@usernames`.
  3. **Deadlines & Due Dates:** Extracted dates and tasks.
  4. **Action Items:** Extracted to-dos and assignments.
- Summaries are saved to `localStorage` and displayed beautifully on the frontend.

---

## 🔄 4. How the Data Flows (Technical Workflow)

### **A. Connecting Telegram**
1. User enters phone number on Frontend (`PlatformSelection` component).
2. Frontend calls `POST /api/telegram/send-otp`.
3. Backend uses MTProto to request a code to the user's Telegram app.
4. User enters OTP code.
5. Frontend calls `POST /api/telegram/verify-otp`.
6. Backend verifies, generates a persistent session string, saves it to PostgreSQL, and returns success.

### **B. Fetching Dashboard Data**
1. Frontend `ngOnInit` checks if the user is connected (`GET /api/telegram/status`).
2. If connected, it fetches the chat list (`GET /api/telegram/dialogs`).
3. The Backend instantiates the TelegramClient using the DB session string, fetches the dialogs, maps them to a clean format, and returns them to the UI.

### **C. Generating an AI Summary**
1. User clicks **"Summarize"** on a chat and selects **"Today"**.
2. Frontend shows a loading spinner and calls `POST /api/summarize/chat`.
3. Backend:
   - Connects to Telegram via MTProto.
   - Fetches the last 200 messages for that chat.
   - Filters messages to only include those sent "Today".
   - Formats the messages into a text block `[Time] @username: message`.
   - Sends a heavily engineered prompt + the messages to the `gemini-2.5-flash` API, strictly requesting JSON output.
   - Parses the JSON and returns it to the frontend.
4. Frontend updates its Signals and renders the summary inline within the chat card.

---

## 📂 5. Key File Structure

### **Frontend (`/src/app/`)**
- `dashboard.ts`: The main UI where users view chats and trigger summaries.
- `telegram.service.ts`: Handles all HTTP calls to the backend regarding Telegram and AI, and manages state using Signals (`dialogs`, `summaries`).
- `platform-selection.ts`: The UI for the Telegram Phone/OTP login flow.
- `summaries.ts`: A dedicated page to view past saved AI summaries.
- `platform.service.ts`: Manages the state of connected platforms.

### **Backend (`/backend/`)**
- `server.js`: The monolithic Express server containing all routes:
  - Auth routes (`/api/signup`, `/api/login`)
  - Telegram Auth routes (`/api/telegram/send-otp`, `/verify-otp`)
  - Telegram Data routes (`/api/telegram/dialogs`)
  - AI Summarization routes (`/api/summarize`, `/api/summarize/chat`)
- `.env`: Stores sensitive keys like `DATABASE_URL`, `JWT_SECRET`, and `GEMINI_API_KEY`.

---

## 6. Future Scope / What's Next
- **Platform Expansion:** The UI already has placeholders for Gmail, Discord, and Slack. The next step is to implement their respective OAuth flows and API integrations.
- **Database Storage for Summaries:** Currently, summaries are cached in `localStorage` on the frontend. This should be moved to PostgreSQL to sync across devices.
- **Pagination for Messages:** Currently, the backend fetches the last 200 messages for summarization. For highly active chats, true pagination logic might be needed to capture the entire day's context.
