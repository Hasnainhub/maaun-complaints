import { createClient } from "@/lib/supabase/server";
import { classifyComplaint } from "@/lib/ai/deepseek";
import { redirect } from "next/navigation";

export async function submitComplaint(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title || !description) {
        return redirect("/submit?error=Missing required fields");
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    // 1. Analyze with AI
    const aiResult = await classifyComplaint(title, description);

    // 2. Map department string to department UUID in DB
    // This uses a service role or anon key. The user can read departments per RLS.
    const { data: deptData } = await supabase
        .from("departments")
        .select("id")
        .eq("name", aiResult.data.department)
        .single();

    const assigned_department_id = deptData?.id || null; // Will be null if mapping fails

    // 3. Insert complaint
    const { data: complaintData, error } = await supabase
        .from("complaints")
        .insert({
            created_by: user.id,
            title,
            description,
            category: aiResult.data.category,
            priority: aiResult.data.priority,
            status: "pending",
            assigned_department_id,
            ai_provider: aiResult.provider,
            ai_confidence: aiResult.data.confidence,
        })
        .select("tracking_id")
        .single();

    if (error) {
        console.error("Failed to insert complaint", error);
        return redirect("/submit?error=Failed to submit complaint. Please try again.");
    }

    // 4. Redirect to track page with new ID
    return redirect(`/track?id=${complaintData.tracking_id}&success=Complaint submitted successfully!`);
}
