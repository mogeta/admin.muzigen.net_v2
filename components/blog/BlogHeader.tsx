import Image from 'next/image';
import { User } from 'firebase/auth';

interface BlogHeaderProps {
  user: User;
  onSignOut: () => void;
}

export default function BlogHeader({ user, onSignOut }: BlogHeaderProps) {
  return (
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
              Blog Contents
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
              onClick={onSignOut}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
