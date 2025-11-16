'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * AuthGuard component that protects routes from unauthorized access.
 * Redirects to signin page if user is not authenticated.
 *
 * @param children - The content to render if user is authenticated
 * @param fallback - Optional loading component to show while checking auth
 * @param redirectTo - Optional redirect path (defaults to '/signin')
 */
export default function AuthGuard({
  children,
  fallback,
  redirectTo = '/signin'
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // Show loading state
  if (loading) {
    return fallback || (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!user) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
