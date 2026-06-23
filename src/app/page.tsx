import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Activity } from "lucide-react";

export default function Home() {
    return (
        <main className="flex-1 flex flex-col pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center pb-20">

                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-5xl border-b pb-4 mb-4 font-extrabold tracking-tight text-brand-dark dark:text-white sm:text-6xl">
                        MAAUN <br className="hidden sm:block" /> AI Enhanced Complaint Tracking Management System
                    </h1>
                    <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
                        AI-enhanced tracking and resolution platform for Maryam Abacha American University.
                        Submit, track, and resolve issues efficiently.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/submit"
                            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 md:text-lg transition-colors shadow-lg hover:shadow-xl"
                        >
                            Get Started <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                        <Link
                            href="/track"
                            className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 dark:border-gray-700 text-base font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 md:text-lg transition-colors"
                        >
                            Track Complaint
                        </Link>
                    </div>
                </div>

                {/* Features Section */}
                <div className="grid md:grid-cols-3 gap-8 mt-12">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Smart Routing</h3>
                        <p className="text-gray-600 dark:text-gray-400">Our AI instantly categorizes and routes your complaint to the correct department (ICT, Hostel, etc.) for faster resolution.</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-4">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Real-time Tracking</h3>
                        <p className="text-gray-600 dark:text-gray-400">Get a unique Tracking ID and monitor the real-time status of your complaint as it moves from pending to resolved.</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center mb-4">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
                        <p className="text-gray-600 dark:text-gray-400">Strict role-based access ensures only you and authorized department officers can view or update your complaints.</p>
                    </div>
                </div>

            </div>
        </main>
    );
}
