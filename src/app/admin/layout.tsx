import Link from "next/link";
import { LayoutDashboard, Users, FileText } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto mt-6 px-4 gap-6">
            {/* Sidebar for Admin */}
            <aside className="w-full md:w-64 flex flex-col gap-2">
                <h2 className="font-bold text-gray-500 uppercase tracking-wider text-xs mb-4 ml-2">Admin Menu</h2>
                <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-200 font-medium">
                    <LayoutDashboard className="w-5 h-5 text-blue-600" />
                    Overview
                </Link>
                <Link href="/admin/complaints" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-200 font-medium">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    All Complaints
                </Link>
                <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-200 font-medium">
                    <Users className="w-5 h-5 text-green-600" />
                    User Management
                </Link>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 border-gray-200 dark:border-gray-800">
                {children}
            </div>
        </div>
    );
}
