import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return redirect(`/login?message=${encodeURIComponent(error.message)}`);
    }

    revalidatePath('/', 'layout');
    return redirect("/my-complaints");
}

export async function signup(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("full_name") as string;
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    });

    if (error) {
        return redirect(`/login?message=${encodeURIComponent(error.message)}`);
    }

    revalidatePath('/', 'layout');

    if (data.session) {
        return redirect("/my-complaints");
    } else {
        return redirect("/login?message=Check email to continue sign in process or try logging in if email confirmation is disabled.");
    }
}

export async function signOut() {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect("/");
}
