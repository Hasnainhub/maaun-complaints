# MAAUN AI-Enhanced Complaint Tracking Management System

A beginner-friendly full-stack Next.js application for managing university complaints with AI-powered auto-classification.

## Features
- **Student/Staff Portal**: Submit and track complaints using a tracking ID.
- **AI Classification**: Uses DeepSeek API (with keyword fallback) to automatically categorize complaints, assign a priority, and route them to the correct department (ICT, Hostel, Finance, Security, Academics, Admin).
- **Department Dashboard**: Department officers can view and update complaints assigned to them.
- **Admin Dashboard**: Admins can view analytics, override AI classifications, and manage users.
- **Real-time Tracking**: Secure tracking with tracking IDs (e.g., `MAAUN-2026-000001`).

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide Icons, Recharts
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security)
- **AI Provider**: DeepSeek API

## Project Setup Instructions

### 1. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the SQL Editor in your Supabase dashboard.
3. Run the complete script from `supabase/01_schema.sql`.
4. Run the complete script from `supabase/02_rls.sql`.

### 2. Environment Variables
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in the placeholders in `.env.local`:
   - `<SUPABASE_URL>`: Get this from Supabase Dashboard -> Project Settings -> API.
   - `<SUPABASE_ANON_KEY>`: Get this from Supabase Dashboard -> Project Settings -> API.
   - `<SUPABASE_SERVICE_ROLE_KEY>`: Get this from Supabase Dashboard -> Project Settings -> API (`service_role` secret).
   - `<DEEPSEEK_API_KEY>`: Your DeepSeek API key.

### 3. Install Dependencies & Run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Setting Up Accounts

1. **Student/Staff**: Simply sign up on the `/login` page. A `student` role is assigned by default.
2. **Admin & Department Officers**: 
   Since the app restricts role changes for security:
   1. Sign up on the `/login` page first.
   2. Go to the Supabase Dashboard -> Table Editor -> `profiles`.
   3. Find your user row and manually change the `role` cell to `admin` or `department_officer`.
   4. If making a `department_officer`, also set the `department_id` to one of the UUIDs from the `departments` table.
   5. You can now use the Admin Dashboard (`/admin`) to manage other users' roles directly in the app.

## Demo Walkthrough

1. **Submit a Complaint**: Log in as a student, go to `/submit`. Enter a complaint (e.g., "The WiFi in the female hostel is not working"). The AI will read this, categorize it, and route it to the "ICT" or "Hostel" department.
2. **Track a Complaint**: Go to `/track` and enter the Tracking ID shown after submission.
3. **Department Processing**: Log in as a Department Officer, go to `/department`, see the assigned complaint, and update the status to "In Progress".
4. **Admin Overview**: Log in as an Admin, go to `/admin` to see charts and overview. You can reassign the complaint or change its priority.

## Common Errors and Fixes
- `FetchError: unauthorized`: Ensure your RLS policies are set up correctly by running `02_rls.sql`.
- `Module not found` after pulling code: Run `npm install` again.
- Next.js hydration validation errors: Ensure browser extensions aren't altering the injected HTML.
