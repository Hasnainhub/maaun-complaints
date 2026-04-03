/**
 * Database types for Supabase and the Application
 */

export type UserRole = 'student' | 'staff' | 'admin' | 'department_officer';
export type ComplaintPriority = 'low' | 'medium' | 'high';
export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved';
export type AIProvider = 'deepseek' | 'fallback';

export interface Department {
    id: string; // UUID
    name: string;
}

export interface Profile {
    id: string; // UUID references auth.users
    full_name: string;
    role: UserRole;
    department_id: string | null;
    created_at: string;
}

export interface Complaint {
    id: string; // UUID
    tracking_id: string;
    created_by: string; // UUID
    title: string;
    description: string;
    category: string;
    priority: ComplaintPriority;
    status: ComplaintStatus;
    assigned_department_id: string | null;
    ai_provider: AIProvider;
    ai_confidence: number | null;
    created_at: string;
    updated_at: string;
}

export interface ComplaintUpdate {
    id: string; // UUID
    complaint_id: string; // UUID
    updated_by: string; // UUID
    message: string;
    status: ComplaintStatus;
    created_at: string;
}
