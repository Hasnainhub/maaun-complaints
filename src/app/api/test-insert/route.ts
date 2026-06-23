import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("complaints")
        .insert({
            title: "Test Complaint",
            description: "Test Description",
            category: "Test",
            priority: "medium",
            status: "pending",
            ai_provider: "fallback",
            ai_confidence: 0.5,
        })
        .select("tracking_id")
        .single();

    return NextResponse.json({ data, error });
}
