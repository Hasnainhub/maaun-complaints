-- 01_schema.sql: Tables, triggers, and seeds

-- Create ENUM types for roles, priorities, and statuses
CREATE TYPE user_role AS ENUM ('student', 'staff', 'admin', 'department_officer');
CREATE TYPE complaint_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE complaint_status AS ENUM ('pending', 'in_progress', 'resolved');

-- 1. Departments Table
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL
);

-- 2. Profiles Table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Complaints Table
CREATE TABLE public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_id TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority complaint_priority NOT NULL DEFAULT 'low',
    status complaint_status NOT NULL DEFAULT 'pending',
    assigned_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    ai_provider TEXT NOT NULL CHECK (ai_provider IN ('deepseek', 'fallback')),
    ai_confidence NUMERIC CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Complaint Updates Table
CREATE TABLE public.complaint_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    status complaint_status NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_complaints_updated_at
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    'student'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to generate sequential tracking IDs based on the year
CREATE SEQUENCE IF NOT EXISTS complaint_seq;

CREATE OR REPLACE FUNCTION generate_tracking_id()
RETURNS TRIGGER AS $$
DECLARE
    year_str TEXT;
    seq_val TEXT;
BEGIN
    year_str := TO_CHAR(NOW(), 'YYYY');
    seq_val := LPAD(nextval('complaint_seq')::TEXT, 6, '0');
    NEW.tracking_id := 'MAAUN-' || year_str || '-' || seq_val;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_tracking_id
    BEFORE INSERT ON public.complaints
    FOR EACH ROW
    WHEN (NEW.tracking_id IS NULL)
    EXECUTE FUNCTION generate_tracking_id();

-- Seed Default Departments
INSERT INTO public.departments (name) VALUES 
    ('ICT'),
    ('Hostel'),
    ('Finance'),
    ('Security'),
    ('Academics'),
    ('Admin')
ON CONFLICT (name) DO NOTHING;
