'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

interface DataConnection {
  id: string;
  name: string;
  type: 'broker' | 'bank' | 'manual';
  status: 'active' | 'pending' | 'error';
  lastSync: string;
  accounts: {
    id: string;
    name: string;
    type: string;
    balance: number;
  }[];
}

export default function DataPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleAddConnection = async (type: DataConnection['type']) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const response = await fetch('/api/data/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add connection');
      }

      const newConnection = await response.json();
      setConnections(prev => [...prev, newConnection]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add connection');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Data Connections</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => handleAddConnection('broker')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Add Broker
          </button>
          <button
            onClick={() => handleAddConnection('bank')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Add Bank
          </button>
          <button
            onClick={() => handleAddConnection('manual')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Manual Entry
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.map((connection) => (
          <div
            key={connection.id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {connection.name}
                </h2>
                <p className="text-sm text-gray-500 capitalize">
                  {connection.type}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  connection.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : connection.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {connection.status}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Last Sync</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(connection.lastSync).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Connected Accounts</p>
                <div className="space-y-2">
                  {connection.accounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {account.name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {account.type}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ${account.balance.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 