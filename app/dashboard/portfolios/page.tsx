'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Portfolio {
  id: string;
  name: string;
  description: string;
  risk_profile: string;
  target_allocation: {
    asset: string;
    percentage: number;
  }[];
  total_value: number;
  expected_return: number;
  volatility: number;
  sharpe_ratio: number;
  created_at: string;
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
    allTime: number;
  };
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
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      router.push('/auth');
      return;
    }
    setLoading(false);
  };

  const fetchPortfolios = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('Not authenticated');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching portfolios:', fetchError);
        setError('Failed to fetch portfolios');
        return;
      }

      setPortfolios(data || []);
    } catch (err) {
      console.error('Error in fetchPortfolios:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
        <Button onClick={fetchPortfolios}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Portfolios</h1>
        <Button onClick={() => router.push('/dashboard/create')}>
          Create New Portfolio
        </Button>
      </div>

      {portfolios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <Card 
              key={portfolio.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/dashboard/portfolio/${portfolio.id}`)}
            >
              <CardHeader>
                <CardTitle>{portfolio.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{portfolio.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Risk Profile</h4>
                  <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                    {portfolio.risk_profile}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Target Allocation</h4>
                  <div className="space-y-1">
                    {portfolio.target_allocation.map((allocation) => (
                      <div key={allocation.asset} className="flex justify-between text-sm">
                        <span>{allocation.asset}</span>
                        <span className="font-medium">{allocation.percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Performance</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Daily</span>
                      <span className={portfolio.performance.daily >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {portfolio.performance.daily.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly</span>
                      <span className={portfolio.performance.monthly >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {portfolio.performance.monthly.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Yearly</span>
                      <span className={portfolio.performance.yearly >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {portfolio.performance.yearly.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  Created: {new Date(portfolio.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No portfolios yet. Create one to get started!</p>
          <Button onClick={() => router.push('/dashboard/create')}>
            Create Portfolio
          </Button>
        </div>
      )}
    </div>
  );
} 