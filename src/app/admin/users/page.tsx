import { createClient } from "@/lib/supabase/server";
import { adminUpdateUserRole } from "../actions";

export default async function AdminUsers() {
    const supabase = createClient();

    // Fetch all profiles
    const { data: users } = await supabase
        .from("profiles")
        .select(`*, departments (name)`)
        .order("created_at", { ascending: false });

    // Fetch departments for the department officer assignment dropdown
    const { data: departments } = await supabase
        .from("departments")
        .select("id, name")
        .order("name");

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-6">
            <h1 className="text-2xl font-bold mb-6">User Management</h1>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b dark:border-gray-700">
                            <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Name (ID)</th>
                            <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Current Role</th>
                            <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Current Department</th>
                            <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Change Attributes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {users?.map((u) => (
                            <tr key={u.id}>
                                <td className="p-3">
                                    <p className="font-semibold text-sm truncate">{u.full_name}</p>
                                    <p className="text-[10px] text-gray-400 font-mono mt-1">{u.id}</p>
                                </td>
                                <td className="p-3">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded-full uppercase tracking-wider font-medium">
                                        {u.role.replace("_", " ")}
                                    </span>
                                </td>
                                <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                                    {u.role === 'department_officer' ? (u.departments?.name || 'Unassigned') : 'N/A'}
                                </td>
                                <td className="p-3">
                                    <form action={adminUpdateUserRole} className="flex gap-2 items-center flex-wrap">
                                        <input type="hidden" name="user_id" value={u.id} />

                                        <select
                                            name="role"
                                            defaultValue={u.role}
                                            className="text-xs border rounded p-1 dark:bg-gray-700 dark:border-gray-600"
                                        >
                                            <option value="student">Student</option>
                                            <option value="staff">Staff</option>
                                            <option value="department_officer">Dept Officer</option>
                                            <option value="admin">Admin</option>
                                        </select>

                                        <select
                                            name="department_id"
                                            defaultValue={u.department_id || ""}
                                            // Simplified logic: Dropdown is always visible, but backend validates it.
                                            className="text-xs border rounded p-1 dark:bg-gray-700 dark:border-gray-600 w-32"
                                        >
                                            <option value="">No Department</option>
                                            {departments?.map((d: any) => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>

                                        <button type="submit" className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">
                                            Update
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
