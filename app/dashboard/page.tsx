'use client';

import { useAuth } from '@/lib/AuthContext';
import Image from 'next/image';
import AuthGuard from '@/components/AuthGuard';

function DashboardContent() {
  const { user, signOut } = useAuth();

  // user is guaranteed to be non-null here because of AuthGuard
  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image
                className="dark:invert"
                src="/next.svg"
                alt="Next.js logo"
                width={80}
                height={16}
              />
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {user.displayName || user.email}
                </span>
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Welcome back, {user.displayName || 'User'}!
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Total Users
              </h3>
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">1,234</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">+12.5% from last month</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Revenue
              </h3>
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">$45,231</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">+8.2% from last month</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Active Sessions
              </h3>
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">573</p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">+3.1% from last hour</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Conversion Rate
              </h3>
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">24.5%</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">+5.4% from last month</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              { action: 'New user registration', time: '2 minutes ago', type: 'success' },
              { action: 'Payment received', time: '15 minutes ago', type: 'success' },
              { action: 'Server backup completed', time: '1 hour ago', type: 'info' },
              { action: 'New feature deployed', time: '3 hours ago', type: 'success' },
              { action: 'System maintenance scheduled', time: '5 hours ago', type: 'warning' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <span className="text-sm text-zinc-900 dark:text-zinc-100">
                    {activity.action}
                  </span>
                </div>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
