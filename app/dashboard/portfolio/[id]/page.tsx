'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { use } from 'react';

interface Portfolio {
  id: string;
  name: string;
  description: string;
  risk_profile: string;
  target_allocation: Array<{
    asset: string;
    percentage: number;
  }>;
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

export default function PortfolioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          throw new Error('Not authenticated');
        }

        // Fetch the portfolio
        const { data, error: portfolioError } = await supabase
          .from('portfolios')
          .select('*')
          .eq('id', resolvedParams.id)
          .single();

        if (portfolioError) {
          throw new Error(portfolioError.message);
        }

        if (!data) {
          throw new Error('Portfolio not found');
        }

        setPortfolio(data);
      } catch (err) {
        console.error('Error fetching portfolio:', err);
        setError(err instanceof Error ? err.message : 'Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4">
          {error}
        </div>
        <Button onClick={() => router.push('/dashboard/portfolios')}>
          Back to Portfolios
        </Button>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-4">
          Portfolio not found
        </div>
        <Button onClick={() => router.push('/dashboard/portfolios')}>
          Back to Portfolios
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{portfolio.name}</h1>
        <Button onClick={() => router.push('/dashboard/portfolios')}>
          Back to Portfolios
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600">{portfolio.description}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Risk Profile</h4>
                <p className="text-gray-600 capitalize">{portfolio.risk_profile}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Total Value</h4>
                <p className="text-2xl font-bold">${portfolio.total_value.toLocaleString()}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Expected Return</h4>
                <p className="text-2xl font-bold">{(portfolio.expected_return * 100).toFixed(1)}%</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Volatility</h4>
                <p className="text-2xl font-bold">{(portfolio.volatility * 100).toFixed(1)}%</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Sharpe Ratio</h4>
                <p className="text-2xl font-bold">{portfolio.sharpe_ratio.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolio.target_allocation.map((allocation) => (
                <div key={allocation.asset}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{allocation.asset}</span>
                    <span className="text-sm font-medium">{allocation.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${allocation.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <h4 className="font-medium mb-2">Daily</h4>
                <p className={`text-2xl font-bold ${portfolio.performance.daily >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolio.performance.daily >= 0 ? '+' : ''}{portfolio.performance.daily.toFixed(2)}%
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Weekly</h4>
                <p className={`text-2xl font-bold ${portfolio.performance.weekly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolio.performance.weekly >= 0 ? '+' : ''}{portfolio.performance.weekly.toFixed(2)}%
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Monthly</h4>
                <p className={`text-2xl font-bold ${portfolio.performance.monthly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolio.performance.monthly >= 0 ? '+' : ''}{portfolio.performance.monthly.toFixed(2)}%
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Yearly</h4>
                <p className={`text-2xl font-bold ${portfolio.performance.yearly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolio.performance.yearly >= 0 ? '+' : ''}{portfolio.performance.yearly.toFixed(2)}%
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">All Time</h4>
                <p className={`text-2xl font-bold ${portfolio.performance.allTime >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolio.performance.allTime >= 0 ? '+' : ''}{portfolio.performance.allTime.toFixed(2)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 