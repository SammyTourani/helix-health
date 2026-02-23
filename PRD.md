# Helix Health — Product Requirements Document
## The Problem
Patients see an average of 4+ specialists. A cardiologist doesn't know about the anxiety meds prescribed by a psychiatrist. An orthopedist doesn't see the autoimmune diagnosis from a rheumatologist. An ER doctor starts from scratch every time. This fragmentation kills people and wastes billions of dollars annually.

## The Product
**Helix** is a patient-owned unified health record platform. Patients connect all their providers, control who sees what, and AI generates a context-brief before every appointment so every specialist has the full picture — instantly.

**Tagline:** "Your complete health story, one source of truth."

---

## Tech Stack
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Next.js API Routes + Server Actions
- **Auth & DB:** Supabase (email/password auth, row-level security)
- **AI:** OpenAI GPT-4o for health summaries (use OPENAI_API_KEY env var)
- **File Storage:** Supabase Storage
- **Deploy:** Vercel
- **Design style:** Clean, medical-professional but warm. Think Linear meets Apple Health. Dark mode default.

---

## Color Palette
- Background: `#0a0a0f` (deep navy black)
- Surface: `#12121a` (slightly lighter)
- Border: `#1e1e2e`
- Primary: `#6366f1` (indigo — trust + innovation)
- Primary hover: `#4f46e5`
- Accent: `#22d3ee` (cyan — health + data)
- Text primary: `#f8fafc`
- Text muted: `#94a3b8`
- Success: `#22c55e`
- Warning: `#f59e0b`
- Danger: `#ef4444`

---

## Database Schema (Supabase)

### Tables

**users** (extends Supabase auth.users)
- id (uuid, FK to auth.users)
- full_name (text)
- date_of_birth (date)
- blood_type (text) — A+, A-, B+, B-, AB+, AB-, O+, O-
- allergies (text[]) — array of allergy strings
- emergency_contact_name (text)
- emergency_contact_phone (text)
- avatar_url (text)
- created_at (timestamptz)

**health_records**
- id (uuid, primary key)
- user_id (uuid, FK to users)
- type (text) — 'condition', 'medication', 'visit', 'lab', 'imaging', 'procedure', 'vaccination', 'allergy'
- title (text) — e.g. "Type 2 Diabetes", "Lisinopril 10mg", "Cardiology Visit"
- description (text)
- date (date) — when this occurred
- end_date (date) — for conditions/medications (null = ongoing)
- status (text) — 'active', 'resolved', 'discontinued'
- provider_name (text) — which doctor/specialist
- specialty (text) — 'Cardiology', 'Primary Care', 'Psychiatry', etc.
- notes (text)
- metadata (jsonb) — flexible: dosage, lab values, imaging type, etc.
- document_url (text) — link to uploaded document in Supabase Storage
- created_at (timestamptz)
- updated_at (timestamptz)

**providers**
- id (uuid, primary key)
- user_id (uuid, FK to users) — the patient
- name (text) — provider full name
- specialty (text)
- clinic_name (text)
- email (text)
- phone (text)
- has_access (boolean) — whether they can view the patient's records
- access_level (text) — 'full', 'relevant', 'summary_only'
- invited_at (timestamptz)
- accepted_at (timestamptz)
- created_at (timestamptz)

**share_links**
- id (uuid, primary key)
- user_id (uuid, FK to users)
- token (text, unique) — random secure token
- recipient_name (text)
- purpose (text) — "Cardiologist appointment Jan 2026"
- access_level (text) — 'full', 'filtered', 'summary'
- filter_specialties (text[]) — if filtered, only show records from these specialties
- expires_at (timestamptz)
- viewed_at (timestamptz)
- view_count (int)
- created_at (timestamptz)

**ai_summaries**
- id (uuid, primary key)
- user_id (uuid, FK to users)
- specialty (text) — generated for which specialty
- summary (text) — the AI-generated brief
- key_conditions (text[])
- current_medications (text[])
- recent_visits (text[])
- cautions (text[]) — drug interactions, allergies, important flags
- generated_at (timestamptz)

---

## Pages & Features

### 1. Landing Page `/`
Full marketing page. Sections:
- **Hero**: Bold headline "Your health story, finally in one place." + subheadline about specialists working in silos. CTA: "Get Started Free" + "See How It Works". Show a beautiful mockup/preview of the dashboard.
- **Problem section**: 3 pain points with icons — "Your cardiologist doesn't know your medications", "Every new specialist starts from scratch", "Critical information gets lost between appointments"
- **How it works**: 3 steps — 1. Build your health timeline, 2. Add your providers, 3. Share intelligently with one click
- **Features section**: 6 feature cards — Unified Timeline, AI Health Briefs, Secure Provider Sharing, Document Storage, Medication Tracker, Emergency Access
- **Stats**: "1 in 5 medication errors occur due to poor care coordination" / "Patients see avg 4+ specialists" / "80% of serious medical errors involve communication failures"
- **CTA section**: "Own your health story" with sign up
- **Footer**: Clean with nav links

### 2. Auth Pages
- `/login` — email + password, Google OAuth option
- `/signup` — name, email, password, date of birth
- `/auth/callback` — Supabase OAuth callback

### 3. Onboarding `/onboarding`
Multi-step wizard after first sign up:
- Step 1: Basic profile (name already set, DOB, blood type, allergies)
- Step 2: Add first condition or medication (or skip)
- Step 3: Add first provider (or skip)
- Step 4: Success — go to dashboard

### 4. Dashboard `/dashboard`
The main view. Left sidebar nav + main content.

**Sidebar:**
- Logo (Helix ⚕)
- Nav: Dashboard, Timeline, Records, Providers, Share, AI Brief, Settings
- User avatar + name at bottom
- Sign out

**Dashboard main:**
- Welcome header with date
- Quick stats: Active conditions, Current medications, Providers, Records count
- "Your health at a glance" — 2 column layout:
  - Left: Active conditions list (with specialty tag)
  - Right: Current medications list (with dosage)
- Recent records (last 5 additions)
- Upcoming: Suggested actions (e.g., "Generate AI brief before your cardiology appointment")
- Quick Add button (floating action button) for adding records

### 5. Timeline `/dashboard/timeline`
The centerpiece of the app. A beautiful chronological timeline of ALL health records.
- Filter by: All | Conditions | Medications | Visits | Labs | Procedures | Vaccinations
- Year separators
- Each card shows: record type icon, title, date, specialist, status badge
- Click a card to expand full details
- Search bar at top
- Add record button

### 6. Records `/dashboard/records`
Table/grid view of all records with:
- Filter by type, specialty, date range, status
- Sort by date, type, specialty
- Add new record (full form)
- Click to view/edit record detail
- Upload document to record

### 7. Providers `/dashboard/providers`
- List of all providers (card grid)
- Each card: name, specialty, clinic, access status badge, last active
- Add provider button (fill in their details)
- Invite provider to access (generates share link + shows email draft)
- Revoke access button

### 8. Secure Share `/dashboard/share`
- Generate a shareable link for a specific purpose
- Options: full history / filtered by specialty / summary only
- Set expiry (1 day / 1 week / 1 month / no expiry)
- Copy link button
- List of all active share links with view count + last viewed
- Revoke link button
- Public view at `/share/[token]` — beautiful read-only view of records (no auth needed)

### 9. AI Brief `/dashboard/ai-brief`
- Select specialty (Cardiology, Psychiatry, Orthopedics, etc.)
- Click "Generate Brief"
- AI creates a 1-page structured summary:
  - Patient overview (age, blood type, allergies)
  - Relevant conditions for this specialty
  - Current medications + potential interactions to flag
  - Recent visits with this specialty
  - Key lab/imaging results
  - Important notes & cautions
- Copy to clipboard / Print / Share as PDF
- History of past briefs

### 10. Settings `/dashboard/settings`
- Profile (name, DOB, blood type, allergies, emergency contact)
- Security (password, 2FA)
- Privacy (who can see your data)
- Notifications
- Export all data (JSON)
- Delete account

### 11. Public Share View `/share/[token]`
- No auth required — accessible via share link
- Beautiful read-only view
- Shows: patient summary, filtered records per access level
- Header: "Shared with you by [Patient Name] via Helix"
- Expires / view tracking handled server-side

---

## Add Record Form
Fields:
- Type (dropdown: Condition / Medication / Visit / Lab / Imaging / Procedure / Vaccination)
- Title (text)
- Date
- End Date (optional, "Ongoing" checkbox)
- Status (Active / Resolved / Discontinued)
- Provider Name
- Specialty (dropdown with 20+ options)
- Description
- Notes
- Upload Document (PDF, image)
- Dynamic metadata fields based on type:
  - Medication: dosage, frequency, prescribing doctor
  - Lab: lab name, key values, reference ranges
  - Imaging: imaging type (MRI/CT/X-Ray), body region, findings

---

## Key UX Details
- Dark mode by default, light mode toggle available
- Micro-animations on everything with Framer Motion
- Loading skeletons (never blank screens)
- Toast notifications via sonner
- Empty states with helpful CTAs
- Mobile responsive (but optimized for desktop first)
- Tab key focus rings (accessibility)
- Error states with clear messaging
- Row level security in Supabase (users can only see their own data)

---

## Environment Variables Needed
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## File Structure
```
src/
  app/
    (auth)/
      login/page.tsx
      signup/page.tsx
    (dashboard)/
      dashboard/page.tsx
      dashboard/timeline/page.tsx
      dashboard/records/page.tsx
      dashboard/providers/page.tsx
      dashboard/share/page.tsx
      dashboard/ai-brief/page.tsx
      dashboard/settings/page.tsx
      layout.tsx
    share/[token]/page.tsx
    onboarding/page.tsx
    page.tsx (landing)
    layout.tsx
  components/
    ui/ (shadcn components)
    layout/ (sidebar, navbar)
    dashboard/ (page-specific components)
    landing/ (landing page sections)
    forms/ (add record form, etc.)
  lib/
    supabase/ (client, server, middleware)
    db/ (database queries)
    ai/ (OpenAI integration)
    utils.ts
  types/
    database.ts (Supabase types)
    index.ts
```

---

## Priority Order for Building
1. Core infrastructure (Supabase client, middleware, types)
2. Auth (login, signup, session)  
3. Landing page (homepage — this is what investors/users see first)
4. Dashboard layout + sidebar
5. Health records CRUD (timeline + records pages)
6. Providers management
7. AI Brief generation
8. Secure share system
9. Onboarding flow
10. Settings + polish

Build everything. Ship a complete, production-ready app.
