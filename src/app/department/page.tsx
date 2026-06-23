import { createClient } from "@/lib/supabase/server";
import { addComplaintUpdate } from "./actions";
import { Complaint } from "@/types";

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

export default async function DepartmentDashboard() {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // AUTH BYPASS: Allow access without session
    let deptId = null;
    let deptName = "All Departments (Guest)";

    if (user) {
        // Get department info for the logged-in user
        const { data: profile } = await supabase
            .from("profiles")
            .select("department_id, departments(name)")
            .eq("id", user.id)
            .single();
        if (profile) {
            deptId = profile.department_id;
            deptName = profile.departments?.name || "Unknown Department";
        }
    }

    // Fetch complaints (filter by department only if we have a deptId)
    const query = supabase
        .from("complaints")
        .select("*");

    if (deptId) {
        query.eq("assigned_department_id", deptId);
    }

    const { data: complaints } = await query.order("created_at", { ascending: false });

    // Group by status for quick stats
    const stats = {
        total: complaints?.length || 0,
        pending: complaints?.filter((c: any) => c.status === "pending").length || 0,
        in_progress: complaints?.filter((c: any) => c.status === "in_progress").length || 0,
        resolved: complaints?.filter((c: any) => c.status === "resolved").length || 0,
    };

    return (
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 mt-6">
            <div className="mb-8 border-b pb-4 dark:border-gray-800">
                <h1 className="text-3xl font-bold mt-2">Department Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Managing complaints for: <span className="font-semibold text-blue-600 dark:text-blue-400">{deptName}</span>
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-500">Total Assigned</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl shadow border border-yellow-100 dark:border-yellow-900/30">
                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">Pending</p>
                    <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{stats.pending}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl shadow border border-blue-100 dark:border-blue-900/30">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-500">In Progress</p>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{stats.in_progress}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl shadow border border-green-100 dark:border-green-900/30">
                    <p className="text-sm font-medium text-green-600 dark:text-green-500">Resolved</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-400">{stats.resolved}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 font-semibold">
                    Active Complaints
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b dark:border-gray-700">
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Tracking ID</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Issue</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {complaints?.map((c: any) => (
                                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                    <td className="p-4 font-mono text-sm">{c.tracking_id}</td>
                                    <td className="p-4">
                                        <p className="font-semibold text-sm max-w-[250px] truncate" title={c.title}>{c.title}</p>
                                        <p className="text-xs text-gray-500 mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs font-bold capitalize ${c.priority === 'high' ? 'text-red-500' :
                                                c.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                                            }`}>{c.priority}</span>
                                    </td>
                                    <td className="p-4"><StatusBadge status={c.status} /></td>
                                    <td className="p-4 text-right">
                                        <details className="relative">
                                            <summary className="cursor-pointer bg-blue-50 text-blue-600 dark:bg-blue-900/30 font-medium px-3 py-1 rounded text-sm hover:bg-blue-100 transition whitespace-nowrap outline-none list-none marker:hidden">
                                                Update
                                            </summary>
                                            <div className="absolute right-0 top-10 w-80 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg p-4 z-10 text-left">
                                                <form action={addComplaintUpdate} className="flex flex-col gap-3">
                                                    <input type="hidden" name="complaint_id" value={c.id} />
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">New Status</label>
                                                        <select name="status" defaultValue={c.status} className="w-full text-sm p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                                            <option value="pending">Pending</option>
                                                            <option value="in_progress">In Progress</option>
                                                            <option value="resolved">Resolved</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Message / Note</label>
                                                        <textarea name="message" required rows={3} placeholder="Investigating the plumbing leak..." className="w-full text-sm p-2 border rounded dark:bg-gray-700 dark:border-gray-600 resize-none"></textarea>
                                                    </div>
                                                    <button type="submit" className="bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 font-medium">Save Update</button>
                                                </form>
                                            </div>
                                        </details>
                                    </td>
                                </tr>
                            ))}
                            {(!complaints || complaints.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">No complaints assigned to your department.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
