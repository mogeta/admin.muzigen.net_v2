'use client';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Settings page - Protected route using useRequireAuth hook
 * This demonstrates an alternative approach to AuthGuard component
 */
export default function Settings() {
  // useRequireAuth automatically handles authentication check and redirect
  const { user, loading, signOut } = useRequireAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Image
                  className="dark:invert cursor-pointer"
                  src="/next.svg"
                  alt="Next.js logo"
                  width={80}
                  height={16}
                />
              </Link>
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Settings
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Account Settings
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Profile Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Profile Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-20 h-20 rounded-full"
                />
              )}
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Display Name</p>
                <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  {user.displayName || 'Not set'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Email</p>
              <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                {user.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">User ID</p>
              <p className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
                {user.uid}
              </p>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">Email Notifications</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Receive email about your account activity</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">Marketing Emails</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Receive emails about new features and updates</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">
            Danger Zone
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Delete Account
          </button>
        </div>
      </main>
    </div>
  );
}
