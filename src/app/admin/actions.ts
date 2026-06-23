import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function adminUpdateComplaint(formData: FormData) {
    "use server";

    const complaintId = formData.get("complaint_id") as string;
    const category = formData.get("category") as string;
    const priority = formData.get("priority") as string;
    const departmentId = formData.get("department_id") as string;

    if (!complaintId) return;

    const supabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    // AUTH BYPASS: Allow anonymous updates
    const userId = user?.id || null;

    const { error } = await supabase
        .from("complaints")
        .update({
            category: category || undefined,
            priority: priority || undefined,
            assigned_department_id: departmentId || undefined,
        })
        .eq("id", complaintId);

    if (!error) {
        // Add a note that an admin overrode
        await supabase.from("complaint_updates").insert({
            complaint_id: complaintId,
            updated_by: userId,
            message: "Admin updated complaint routing/classification.",
            status: "pending",
        });
    } else {
        console.error(error);
    }

    revalidatePath("/admin/complaints");
}

export async function adminUpdateUserRole(formData: FormData) {
    "use server";

    const userId = formData.get("user_id") as string;
    const role = formData.get("role") as string;
    const departmentIdStr = formData.get("department_id") as string;

    // We only set department ID if the role is department_officer
    const departmentId = role === "department_officer" && departmentIdStr ? departmentIdStr : null;

    if (!userId || !role) return;

    const supabase = createAdminClient();

    // Important: Normal users can't update roles because of RLS.
    // However, the admin CAN update profiles because the RLS policy allows admins `FOR ALL`.
    const { error } = await supabase
        .from("profiles")
        .update({
            role,
            department_id: departmentId
        })
        .eq("id", userId);

    if (error) {
        console.error("Failed to update user role:", error);
    }

    revalidatePath("/admin/users");
}

export async function adminAddComplaintUpdate(formData: FormData) {
    "use server";

    const complaintId = formData.get("complaint_id") as string;
    const message = formData.get("message") as string;
    const status = formData.get("status") as string;

    if (!complaintId || !message || !status) return;

    const supabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    // AUTH BYPASS: Allow anonymous updates
    const userId = user?.id || null;

    // Insert update
    const { error: updateError } = await supabase
        .from("complaint_updates")
        .insert({
            complaint_id: complaintId,
            updated_by: userId,
            message,
            status,
        });

    if (updateError) {
        console.error("Failed to add update:", updateError);
        return;
    }

    // Update main complaint status if changed (DB trigger updates the `updated_at` column)
    const { error: complaintError } = await supabase
        .from("complaints")
        .update({ status })
        .eq("id", complaintId);

    if (complaintError) {
        console.error("Failed to update complaint status:", complaintError);
    }

    revalidatePath(`/admin/complaints`);
    revalidatePath(`/track`);
}
