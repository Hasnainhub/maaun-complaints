import { createAdminClient } from "@/lib/supabase/server";
import { classifyComplaint } from "@/lib/ai/deepseek";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function submitComplaint(formData: FormData) {
    "use server";
    console.log("Submit action called!");

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const contact_number = (formData.get("contact_number") as string) || null;

    if (!title || !description || !location) {
        return redirect("/submit?error=Missing required fields");
    }

    const supabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    // AUTH BYPASS: Allow anonymous submission
    const userId = user?.id || null;

    // 1. Analyze with AI
    console.log("Analyzing with AI...");
    const aiResult = await classifyComplaint(title, description);
    console.log("AI result:", aiResult);

    // 2. Map department string to department UUID in DB
    const { data: deptData, error: deptError } = await supabase
        .from("departments")
        .select("id")
        .eq("name", aiResult.data.department)
        .single();

    if (deptError && deptError.code !== 'PGRST116') {
        console.error("Error fetching department:", deptError);
    }

    const assigned_department_id = deptData?.id || null; 

    // 3. Insert complaint
    console.log("Inserting complaint...");
    const { data: complaintData, error } = await supabase
        .from("complaints")
        .insert({
            created_by: userId,
            title,
            description,
            location,
            contact_number,
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
        console.error("Failed to insert complaint details:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
        });
        return redirect(`/submit?error=Failed to submit complaint: ${error.message}`);
    }

    if (!complaintData) {
        console.error("No complaint data returned after insert");
        return redirect("/submit?error=Failed to retrieve tracking ID. Please contact support.");
    }

    // 4. Redirect to track page with new ID
    revalidatePath('/', 'layout');
    return redirect(`/track?id=${complaintData.tracking_id}&success=Complaint submitted successfully!`);
}
