import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900 text-white">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-5xl font-bold mb-4">NLschedule</h1>
        <p className="text-xl text-primary-100 mb-8">
          Employee scheduling made simple. Manage shifts, track time, and keep
          your team organized.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg border border-primary-400 hover:bg-primary-400 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
