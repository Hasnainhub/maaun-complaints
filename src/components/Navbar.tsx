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
        <nav className="border-b bg-white/70 dark:bg-black/70 backdrop-blur-md border-gray-200/50 dark:border-gray-800/50 p-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-blue dark:text-brand-blueLight hover:text-brand-gold transition-colors">
                    <ShieldAlert className="w-6 h-6" /> MAAUN
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/track" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-blue transition-colors">Track Complaint</Link>
                    <Link href="/admin" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-blue transition-colors">Admin</Link>
                    <Link href="/department" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-blue transition-colors">Department</Link>
                    <Link href="/my-complaints" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-blue transition-colors">My Complaints</Link>
                    <Link href="/submit" className="text-sm font-medium border-2 border-brand-blue text-brand-blue px-4 py-1.5 rounded-full hover:bg-brand-blue hover:text-white dark:border-brand-blueLight dark:text-brand-blueLight dark:hover:bg-brand-blueLight dark:hover:text-white transition-all shadow-sm">New Complaint</Link>
                </div>
            </div>
        </nav>
    )
}
