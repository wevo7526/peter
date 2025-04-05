'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { User } from '@supabase/supabase-js';
import {
  ChartBarIcon,
  SparklesIcon,
  CircleStackIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: ChartBarIcon },
    { name: 'Create', href: '/dashboard/create', icon: SparklesIcon },
    { name: 'Data', href: '/dashboard/data', icon: CircleStackIcon },
    { name: 'Research', href: '/dashboard/research', icon: MagnifyingGlassIcon },
    { name: 'Thesis', href: '/dashboard/thesis', icon: DocumentTextIcon },
    { name: 'Planning', href: '/dashboard/planning', icon: FlagIcon },
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
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      {user && (
        <div className="p-4 border-t border-gray-200 space-y-4">
          <Link
            href="/dashboard/profile"
            className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
              pathname === '/dashboard/profile'
                ? 'bg-emerald-50'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-700 font-medium">
                  {user.email?.[0].toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.email}
              </p>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
} 