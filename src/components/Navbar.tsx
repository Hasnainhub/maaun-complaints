import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/login/actions'
import { ShieldAlert } from 'lucide-react'

export default async function Navbar() {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    let role = 'student'
    if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        role = data?.role || 'student'
    }

    return (
        <nav className="border-b bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400">
                    <ShieldAlert className="w-6 h-6" /> MAAUN
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/track" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600">Track Complaint</Link>
                    {user ? (
                        <>
                            {role === 'admin' && <Link href="/admin" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600">Admin</Link>}
                            {role === 'department_officer' && <Link href="/department" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600">Department</Link>}
                            <Link href="/my-complaints" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600">My Complaints</Link>
                            <Link href="/submit" className="text-sm font-medium border border-blue-600 text-blue-600 px-3 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/50">New Complaint</Link>
                            <form action={signOut}>
                                <button className="text-sm font-medium text-red-600 hover:text-red-700 py-2 px-4 rounded-md">
                                    Logout
                                </button>
                            </form>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="py-2 px-4 rounded-md no-underline text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium"
                        >
                            Login / Sign Up
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
