import { createClient } from "@/lib/supabase/server";
import DashboardChart from "@/components/DashboardChart";

export default async function AdminOverview() {
    const supabase = createClient();

    // 1. Fetch all complaints
    const { data: complaints } = await supabase
        .from("complaints")
        .select("*, departments(name)");

    if (!complaints) return <div>Failed to load stats.</div>;

    // 2. Compute metrics
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === "pending").length;
    const inProgress = complaints.filter(c => c.status === "in_progress").length;
    const resolved = complaints.filter(c => c.status === "resolved").length;

    // 3. Overdue check (pending/in_progress > 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const overdueCount = complaints.filter(
        (c) => (c.status === "pending" || c.status === "in_progress") && new Date(c.created_at) < oneWeekAgo
    ).length;

    // 4. Complaints by department
    const deptMap: Record<string, number> = {};
    complaints.forEach(c => {
        const dept = c.departments?.name || "Unassigned";
        deptMap[dept] = (deptMap[dept] || 0) + 1;
    });
    const chartData = Object.keys(deptMap).map(name => ({
        name,
        count: deptMap[name]
    })).sort((a, b) => b.count - a.count);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-6">
            <h1 className="text-2xl font-bold mb-6">System Overview</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div className="bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Total</p>
                    <p className="text-4xl font-bold text-gray-800 dark:text-white mt-2">{total}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-green-600 uppercase tracking-widest mb-2">Resolved</p>
                    <p className="text-4xl font-bold text-green-700 dark:text-green-500">{resolved}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-2">Active</p>
                    <p className="text-4xl font-bold text-blue-700 dark:text-blue-500">{inProgress + pending}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-2">Overdue (&gt;7d)</p>
                    <p className="text-4xl font-bold text-red-700 dark:text-red-500">{overdueCount}</p>
                </div>
            </div>

            <div className="mt-8 border-t dark:border-gray-700 pt-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Complaints by Department</h2>
                <p className="text-gray-500 text-sm mb-6">Volume of complaints routed to each department</p>

                {chartData.length > 0 ? (
                    <DashboardChart data={chartData} />
                ) : (
                    <p className="text-gray-500 italic py-10 text-center border rounded border-dashed">No data to display yet.</p>
                )}
            </div>
        </div>
    );
}
