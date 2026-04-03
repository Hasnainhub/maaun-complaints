-- 02_rls.sql: Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user department
CREATE OR REPLACE FUNCTION public.get_user_department()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT department_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is dept officer
CREATE OR REPLACE FUNCTION public.is_dept_officer()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'department_officer';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 1. Departments Policies
-- Anyone authenticated can read departments (needed for forms)
CREATE POLICY "Anyone can read departments" ON public.departments
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can manage departments
CREATE POLICY "Admins can manage departments" ON public.departments
    FOR ALL USING (public.is_admin());


-- 2. Profiles Policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (except role and department)
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can read and update all profiles
CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (public.is_admin());

-- Officers can read profiles (useful for seeing who made a complaint)
CREATE POLICY "Officers can read profiles" ON public.profiles
    FOR SELECT USING (public.is_dept_officer());


-- 3. Complaints Policies
-- Users can read their own complaints
CREATE POLICY "Users can read own complaints" ON public.complaints
    FOR SELECT USING (auth.uid() = created_by);

-- Users can insert their own complaints
CREATE POLICY "Users can insert own complaints" ON public.complaints
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Department officers can read complaints assigned to their department
CREATE POLICY "Officers can read department complaints" ON public.complaints
    FOR SELECT USING (assigned_department_id = public.get_user_department());

-- Department officers can update complaints assigned to them (status)
CREATE POLICY "Officers can update department complaints" ON public.complaints
    FOR UPDATE USING (assigned_department_id = public.get_user_department());

-- Admins can manage all complaints
CREATE POLICY "Admins can manage all complaints" ON public.complaints
    FOR ALL USING (public.is_admin());


-- 4. Complaint Updates Policies
-- Users can read updates for their own complaints
CREATE POLICY "Users can read own complaint updates" ON public.complaint_updates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.complaints c 
            WHERE c.id = complaint_id AND c.created_by = auth.uid()
        )
    );

-- Department officers can read updates for their department's complaints
CREATE POLICY "Officers can read department complaint updates" ON public.complaint_updates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.complaints c 
            WHERE c.id = complaint_id AND c.assigned_department_id = public.get_user_department()
        )
    );

-- Department officers can insert updates for their department's complaints
CREATE POLICY "Officers can insert updates" ON public.complaint_updates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.complaints c 
            WHERE c.id = complaint_id AND c.assigned_department_id = public.get_user_department()
        ) AND
        auth.uid() = updated_by
    );

-- Admins can manage all updates
CREATE POLICY "Admins can manage all updates" ON public.complaint_updates
    FOR ALL USING (public.is_admin());
