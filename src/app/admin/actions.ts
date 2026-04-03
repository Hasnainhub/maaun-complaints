import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function adminUpdateComplaint(formData: FormData) {
    "use server";

    const complaintId = formData.get("complaint_id") as string;
    const category = formData.get("category") as string;
    const priority = formData.get("priority") as string;
    const departmentId = formData.get("department_id") as string;

    if (!complaintId) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

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
            updated_by: user.id,
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

    const supabase = createClient();

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
