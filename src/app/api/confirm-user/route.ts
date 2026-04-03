import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    if (!email) return NextResponse.json({error: 'missing email'});

    const supabase = createAdminClient();
    
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) return NextResponse.json({error});
    
    const user = users.find(u => u.email === email);
    if (!user) return NextResponse.json({error: 'user not found'});

    const { data, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: true
    });

    return NextResponse.json({ success: true, user: data, error: updateError });
}
