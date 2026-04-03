import { createClient } from "@/lib/supabase/server";
import { Complaint, ComplaintUpdate, Department } from "@/types";
import { Search } from "lucide-react";
import { redirect } from "next/navigation";

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800",
        in_progress: "bg-blue-100 text-blue-800",
        resolved: "bg-green-100 text-green-800",
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${colors[status]}`}>
            {status.replace("_", " ")}
        </span>
    );
}

export default async function TrackPage({
    searchParams,
}: {
    searchParams: { id?: string; success?: string };
}) {
    const trackingId = searchParams.id;
    const supabase = createClient();

    let complaint: (Complaint & { departments: { name: string } | null }) | null = null;
    let updates: ComplaintUpdate[] = [];

    if (trackingId) {
        // We fetch the complaint ignoring user creation rights because anyone with the
        // exact tracking ID can view it (like a package tracker). Note: The RLS policy
        // currently restricts reading complaints to the creator or admins/officers.
        // If we want public tracking by ID alone, we would need to adjust RLS or use the
        // service role key here. For the strict security asked, the user MUST be the creator.

        // Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();

        // Fetch complaint (Will return null if RLS blocks it - e.g. wrong user)
        const { data } = await supabase
            .from("complaints")
            .select(`
        *,
        departments (name)
      `)
            .eq("tracking_id", trackingId)
            .single();

        if (data) {
            complaint = data;
            // Fetch updates
            const { data: updateData } = await supabase
                .from("complaint_updates")
                .select("*")
                .eq("complaint_id", complaint.id)
                .order("created_at", { ascending: false });

            if (updateData) updates = updateData;
        }
    }

    async function searchComplaint(formData: FormData) {
        "use server";
        const id = formData.get("tracking_id");
        if (id) {
            redirect(`/track?id=${id}`);
        }
    }

    return (
        <main className="flex-1 max-w-4xl w-full mx-auto p-6 mt-10">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-4">Track Complaint</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Enter your Tracking ID to view the current status.
                </p>

                {searchParams.success && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mt-4 inline-block max-w-md w-full rounded shadow-sm">
                        <p className="font-medium">{searchParams.success}</p>
                        <p className="text-sm mt-1">Your Tracking ID is: <strong>{trackingId}</strong></p>
                    </div>
                )}
            </div>

            <div className="max-w-md mx-auto mb-12">
                <form action={searchComplaint} className="flex gap-2">
                    <input
                        name="tracking_id"
                        type="text"
                        defaultValue={trackingId || ""}
                        placeholder="MAAUN-YYYY-XXXXXX"
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center">
                        <Search className="w-5 h-5" />
                    </button>
                </form>
            </div>

            {trackingId && !complaint && (
                <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                    <p className="font-semibold text-lg">Complaint not found or you don't have access.</p>
                    <p className="text-sm mt-2">Make sure you are logged in as the account that created it, and the ID is correct.</p>
                </div>
            )}

            {complaint && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900/50">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold mb-1">
                                {complaint.tracking_id}
                            </p>
                            <h2 className="text-2xl font-bold">{complaint.title}</h2>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <StatusBadge status={complaint.status} />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Created: {new Date(complaint.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-800 dark:text-gray-200">Details</h3>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{complaint.description}</p>

                            <div className="mt-6 space-y-3">
                                <div className="flex bg-gray-50 dark:bg-gray-900 p-3 rounded items-center">
                                    <span className="w-1/3 text-gray-500 font-medium">Department</span>
                                    <span className="font-semibold">{complaint.departments?.name || "Unassigned"}</span>
                                </div>
                                <div className="flex bg-gray-50 dark:bg-gray-900 p-3 rounded items-center">
                                    <span className="w-1/3 text-gray-500 font-medium">Category</span>
                                    <span className="font-semibold">{complaint.category}</span>
                                </div>
                                <div className="flex bg-gray-50 dark:bg-gray-900 p-3 rounded items-center">
                                    <span className="w-1/3 text-gray-500 font-medium">Priority</span>
                                    <span className={`font-semibold capitalize ${complaint.priority === 'high' ? 'text-red-600' :
                                            complaint.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                                        }`}>{complaint.priority}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-800 dark:text-gray-200">Timeline</h3>

                            <div className="space-y-6">
                                {updates.length === 0 ? (
                                    <p className="text-gray-500 italic">No updates have been posted yet. Check back soon.</p>
                                ) : (
                                    updates.map((update) => (
                                        <div key={update.id} className="relative pl-6 border-l-2 border-blue-200 dark:border-blue-900">
                                            <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1"></div>
                                            <p className="text-xs text-gray-500 mb-1">{new Date(update.created_at).toLocaleString()}</p>
                                            <div className="mb-1"><StatusBadge status={update.status} /></div>
                                            <p className="text-gray-700 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-gray-900 p-3 rounded whitespace-pre-wrap text-sm border dark:border-gray-800">
                                                {update.message}
                                            </p>
                                        </div>
                                    ))
                                )}

                                {/* Initial Creation Event */}
                                <div className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-800">
                                    <div className="absolute w-3 h-3 bg-gray-400 rounded-full -left-[7px] top-1"></div>
                                    <p className="text-xs text-gray-500 mb-1">{new Date(complaint.created_at).toLocaleString()}</p>
                                    <p className="text-gray-700 dark:text-gray-300 font-medium">Complaint Submitted & Auto-Routed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
