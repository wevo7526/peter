'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    const checkUserStatus = async () => {
      if (user) {
        try {
          const response = await fetch('/api/user/status');
          if (!response.ok) {
            throw new Error('Failed to check user status');
          }
          
          const data = await response.json();
          
          if (data.hasCompletedOnboarding) {
            // User has completed onboarding, redirect to dashboard
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error checking user status:', error);
        }
      }
    };

    checkUserStatus();
  }, [user, router]);

  const handleSkipOnboarding = async () => {
    try {
      const response = await fetch('/api/user/skip-onboarding', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to skip onboarding');
      }
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-red-500 text-center">
          <p className="text-xl mb-4">Authentication Error</p>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Image
            src="/peter.png"
            alt="Peter Logo"
            width={120}
            height={120}
            className="mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Peter
          </h2>
          <p className="text-gray-600">
            Your AI-powered wealth management platform
          </p>
        </div>

        {user ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-6">
              <Image
                src={user.picture || ''}
                alt={user.name || ''}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <Link
                href="/onboarding/personal"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Start Onboarding
              </Link>
              <button
                onClick={handleSkipOnboarding}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Skip Onboarding
              </button>
              <Link
                href="/api/auth/logout"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign Out
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Link
              href="/api/auth/login"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Sign In
            </Link>
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 