import Link from "next/link";
import { login, signup } from "./actions";

export default function Login({
    searchParams,
}: {
    searchParams: { message: string };
}) {
    console.log(`[Login Page] Rendering. Message: ${searchParams?.message || 'none'}`);
    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto mt-20">
            <Link
                href="/"
                className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center group text-sm"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
                >
                    <polyline points="15 18 9 12 15 6" />
                </svg>{" "}
                Back
            </Link>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-xl border dark:border-gray-800">
                <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">MAAUN Portal</h1>

                {/* Login Form */}
                <form className="flex flex-col gap-4 mb-8" action={login}>
                    <h2 className="text-xl font-semibold mb-2">Sign In</h2>
                    <div>
                        <label className="text-sm font-medium mb-1 block" htmlFor="email">Email</label>
                        <input
                            className="w-full rounded-md px-4 py-2 bg-inherit border dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            name="email"
                            type="email"
                            placeholder="you@maaun.edu.ng"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block" htmlFor="password">Password</label>
                        <input
                            className="w-full rounded-md px-4 py-2 bg-inherit border dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 font-medium transition-colors">
                        Sign In
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t dark:border-gray-700"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-gray-900 px-2 text-gray-500">Or</span></div>
                </div>

                {/* Signup Form */}
                <form className="flex flex-col gap-4" action={signup}>
                    <h2 className="text-xl font-semibold mb-2">Create Account</h2>
                    <div>
                        <label className="text-sm font-medium mb-1 block" htmlFor="signup-email">Email</label>
                        <input
                            id="signup-email"
                            className="w-full rounded-md px-4 py-2 bg-inherit border dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            name="email"
                            type="email"
                            placeholder="you@maaun.edu.ng"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block" htmlFor="full_name">Full Name</label>
                        <input
                            className="w-full rounded-md px-4 py-2 bg-inherit border dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            name="full_name"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block" htmlFor="signup-password">Password</label>
                        <input
                            id="signup-password"
                            className="w-full rounded-md px-4 py-2 bg-inherit border dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md px-4 py-2 font-medium transition-colors">
                        Sign Up
                    </button>
                </form>

                {searchParams?.message && (
                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-center text-sm font-medium rounded-md border border-blue-100 dark:border-blue-900/30">
                        {searchParams.message}
                    </div>
                )}
            </div>
        </div>
    );
}
