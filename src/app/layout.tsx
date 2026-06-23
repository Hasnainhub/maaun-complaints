import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'MAAUN AI Enhanced Complaint Tracking Management System',
    description: 'AI-Enhanced Complaint Tracking Management System',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} bg-maaun-gate bg-cover bg-center bg-fixed`}>
                <div className="min-h-screen flex flex-col text-brand-dark dark:text-brand-light">
                    <Navbar />
                    <main className="flex-grow container mx-auto px-4 py-8 bg-white/60 dark:bg-black/60 backdrop-blur-[2px] shadow-xl rounded-b-xl border border-t-0 border-white/20">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    )
}
