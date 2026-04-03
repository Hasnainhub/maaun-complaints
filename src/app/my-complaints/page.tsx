import { createClient } from "@/lib/supabase/server";
import { Complaint } from "@/types";
import Link from "next/link";
import { FileWarning, ChevronRight } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800",
        in_progress: "bg-blue-100 text-blue-800",
        resolved: "bg-green-100 text-green-800",
    };
    return (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${colors[status]}`}>
            {status.replace("_", " ")}
        </span>
    );
}

export default async function MyComplaints() {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    console.log(`[Complaints Page] Accessing page. User: ${user?.id || 'none'}`);

    if (!user) {
        console.log(`[Complaints Page] No user found, relying on middleware redirect`);
        return null; // Middleware handles redirect
    }

    const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single();

    console.log(`[Complaints Page] Profile found: ${!!profile}, Role: ${profile?.role}`);

    const { data: complaints } = await supabase
        .from("complaints")
        .select(`*, departments (name)`)
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

    console.log(`[Complaints Page] Complaints found: ${complaints?.length || 0}`);

    return (
        <main className="flex-1 max-w-6xl w-full mx-auto p-6 mt-6">
            <div className="flex justify-between items-end mb-8 border-b pb-4 dark:border-gray-800">
                <div>
                    <h1 className="text-3xl font-bold mt-2">My Complaints</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Welcome back, {profile?.full_name} ({profile?.role})
                    </p>
                </div>
                <Link href="/submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition">
                    New Complaint
                </Link>
            </div>

            {!complaints || complaints.length === 0 ? (
                <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <FileWarning className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">No complaints found</h2>
                    <p className="text-gray-500 mb-6">You haven't submitted any complaints yet.</p>
                    <Link href="/submit" className="text-blue-600 font-medium hover:underline">
                        Submit your first complaint &rarr;
                    </Link>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Tracking ID</th>
                                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Title</th>
                                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Department</th>
                                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Date</th>
                                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 flex justify-end"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {complaints.map((c: any) => (
                                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                                        <td className="p-4 font-mono text-sm">{c.tracking_id}</td>
                                        <td className="p-4 font-medium max-w-[200px] truncate" title={c.title}>{c.title}</td>
                                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{c.departments?.name || "Unassigned"}</td>
                                        <td className="p-4"><StatusBadge status={c.status} /></td>
                                        <td className="p-4 text-sm text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">
                                            <Link href={`/track?id=${c.tracking_id}`} className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                View <ChevronRight className="w-4 h-4 ml-1" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </main>
    );
}
