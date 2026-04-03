import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addComplaintUpdate(formData: FormData) {
    "use server";

    const complaintId = formData.get("complaint_id") as string;
    const message = formData.get("message") as string;
    const status = formData.get("status") as string;

    if (!complaintId || !message || !status) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    // Insert update
    const { error: updateError } = await supabase
        .from("complaint_updates")
        .insert({
            complaint_id: complaintId,
            updated_by: user.id,
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

    revalidatePath(`/department`);
    revalidatePath(`/track`);
}
