'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

interface Portfolio {
  id: string;
  name: string;
  description: string;
  positions: Array<{
    symbol: string;
    weight: number;
  }>;
  riskProfile: string;
  targetAllocation: {
    asset: string;
    percentage: number;
  }[];
  created_at: string;
}

export default function PortfoliosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

  useEffect(() => {
    checkUser();
    fetchPortfolios();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }
    setLoading(false);
  };

  const fetchPortfolios = async () => {
    try {
      const response = await fetch('/api/portfolios');
      if (!response.ok) {
        throw new Error('Failed to fetch portfolios');
      }
      const data = await response.json();
      setPortfolios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolios');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Portfolios</h1>
        <button
          onClick={() => router.push('/dashboard/create')}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Create New Portfolio
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio) => (
          <div key={portfolio.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">{portfolio.name}</h3>
            <p className="text-gray-600 mb-4">{portfolio.description}</p>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Risk Profile</h4>
              <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                {portfolio.riskProfile}
              </span>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-2">Positions</h4>
              <div className="flex flex-wrap gap-2">
                {portfolio.positions.map((position) => (
                  <span key={position.symbol} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {position.symbol} ({position.weight.toFixed(1)}%)
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-2">Target Allocation</h4>
              <div className="space-y-1">
                {portfolio.targetAllocation.map((allocation) => (
                  <div key={allocation.asset} className="flex justify-between text-sm">
                    <span>{allocation.asset}</span>
                    <span className="font-medium">{allocation.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Created: {new Date(portfolio.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {portfolios.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No portfolios yet. Create one to get started!</p>
          <button
            onClick={() => router.push('/dashboard/create')}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Create Portfolio
          </button>
        </div>
      )}
    </div>
  );
} 