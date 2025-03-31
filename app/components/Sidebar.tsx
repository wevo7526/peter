'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const { user } = useUser();
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Portfolio Insights', href: '/dashboard/insights', icon: '🔍' },
    { name: 'AI Strategy', href: '/dashboard/strategy', icon: '🤖' },
    { name: 'Market Analysis', href: '/dashboard/market', icon: '📈' },
    { name: 'Goals & Planning', href: '/dashboard/goals', icon: '🎯' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <Image
          src="/peter.png"
          alt="Peter Logo"
          width={32}
          height={32}
          className="mr-2"
        />
        <span className="text-xl font-semibold text-gray-900">Peter</span>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <Image
              src={user.picture || ''}
              alt={user.name || ''}
              width={32}
              height={32}
              className="rounded-full"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <Link
            href="/api/auth/logout"
            className="mt-4 flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
          >
            <span className="mr-3">🚪</span>
            Sign Out
          </Link>
        </div>
      )}
    </div>
  );
} 