import { submitComplaint } from "./actions";

export default function SubmitPage({
    searchParams,
}: {
    searchParams: { error?: string };
}) {
    return (
        <main className="flex-1 max-w-2xl w-full mx-auto p-6 mt-10">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Submit a Complaint</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Please provide details about the issue. Our AI will automatically categorize it and route it to the correct department.
                </p>

                {searchParams.error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                        <p>{searchParams.error}</p>
                    </div>
                )}

                <form action={submitComplaint} className="flex flex-col gap-6">

                    <div className="flex flex-col gap-2">
                        <label htmlFor="title" className="font-semibold text-gray-700 dark:text-gray-300">
                            Complaint Title
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            placeholder="e.g., No water in Block B"
                            required
                            className="px-4 py-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className="font-semibold text-gray-700 dark:text-gray-300">
                            Detailed Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={6}
                            placeholder="Please describe the issue in detail..."
                            required
                            className="px-4 py-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="mt-4 bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition"
                    >
                        Submit Complaint
                    </button>
                </form>
            </div>
        </main>
    );
}
