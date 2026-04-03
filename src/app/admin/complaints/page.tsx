import { createClient } from "@/lib/supabase/server";
import { adminUpdateComplaint } from "../actions";

export default async function AdminComplaints() {
    const supabase = createClient();

    // Fetch all complaints
    const { data: complaints } = await supabase
        .from("complaints")
        .select(`*, departments (name)`)
        .order("created_at", { ascending: false });

    // Fetch all departments for reassignment dropdown
    const { data: departments } = await supabase
        .from("departments")
        .select("id, name")
        .order("name");

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-6">
            <h1 className="text-2xl font-bold mb-6">Manage Complaints</h1>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b dark:border-gray-700">
                            <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Tracking ID</th>
                            <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Title / AI Info</th>
                            <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Update Classification</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {complaints?.map((c) => (
                            <tr key={c.id}>
                                <td className="p-3 font-mono text-sm">{c.tracking_id}</td>
                                <td className="p-3">
                                    <p className="font-semibold text-sm max-w-[200px] truncate" title={c.title}>{c.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {c.ai_provider === 'deepseek' ? '🤖 AI Classified' : '⚠️ Fallback Rules'}
                                        {c.ai_provider === 'deepseek' && c.ai_confidence && ` (${(c.ai_confidence * 100).toFixed(0)}%)`}
                                    </p>
                                </td>
                                <td className="p-3">
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded uppercase tracking-wider font-medium">
                                        {c.status}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <form action={adminUpdateComplaint} className="flex gap-2 items-center flex-wrap">
                                        <input type="hidden" name="complaint_id" value={c.id} />

                                        <select name="department_id" defaultValue={c.assigned_department_id || ""} className="text-xs border rounded p-1 dark:bg-gray-700 dark:border-gray-600">
                                            <option value="">Unassigned</option>
                                            {departments?.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>

                                        <select name="priority" defaultValue={c.priority} className="text-xs border rounded p-1 dark:bg-gray-700 dark:border-gray-600">
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>

                                        <button type="submit" className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700">
                                            Save
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
