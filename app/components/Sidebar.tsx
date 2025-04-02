'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const { user } = useUser();
  const pathname = usePathname();

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: '📊' },
    { name: 'Create', href: '/dashboard/create', icon: '✨' },
    { name: 'Data', href: '/dashboard/data', icon: '🔌' },
    { name: 'Research', href: '/dashboard/research', icon: '🔬' },
    { name: 'Thesis', href: '/dashboard/thesis', icon: '📝' },
    { name: 'Planning', href: '/dashboard/planning', icon: '🎯' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div className="w-[100px] h-[100px] relative">
          <Image
            src="/peter.png"
            alt="Peter Logo"
            fill
            className="object-contain"
          />
        </div>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
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
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm font-medium">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 