'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  ScaleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  LightBulbIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '@/app/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User } from '@supabase/supabase-js';

interface Portfolio {
  id: string;
  name: string;
  description: string;
  risk_profile: string;
  target_allocation: {
    asset: string;
    percentage: number;
  }[];
  created_at: string;
  performance?: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

interface MarketOverview {
  market: string;
  change: number;
  trend: 'up' | 'down';
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [marketOverview, setMarketOverview] = useState<MarketOverview[]>([
    { market: 'S&P 500', change: 1.2, trend: 'up' },
    { market: 'NASDAQ', change: 0.8, trend: 'up' },
    { market: 'Dow Jones', change: -0.3, trend: 'down' },
  ]);

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
    setUser(user);
    setLoading(false);
  };

  const fetchPortfolios = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Add mock performance data for now
      const portfoliosWithPerformance = (data || []).map(portfolio => ({
        ...portfolio,
        performance: {
          daily: Math.random() * 2 - 1,
          weekly: Math.random() * 5 - 2,
          monthly: Math.random() * 10 - 5,
        }
      }));

      setPortfolios(portfoliosWithPerformance);
    } catch (err) {
      setPortfolios([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.email?.split('@')[0]}</h1>
          <p className="text-gray-500">Here's what's happening with your portfolios today</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/dashboard/research')}>
            <LightBulbIcon className="w-5 h-5 mr-2" />
            Research
          </Button>
          <Button onClick={() => router.push('/dashboard/create')}>
            <SparklesIcon className="w-5 h-5 mr-2" />
            Create Portfolio
          </Button>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {marketOverview.map((market) => (
          <Card key={market.market}>
            <CardHeader>
              <CardTitle className="text-lg">{market.market}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                {market.trend === 'up' ? (
                  <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-500 mr-2" />
                ) : (
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-500 mr-2" />
                )}
                <span className={`text-lg font-semibold ${
                  market.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {market.change > 0 ? '+' : ''}{market.change}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-6 w-6 text-emerald-500 mr-2" />
              <CardTitle className="text-lg">Total Portfolios</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{portfolios.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center">
              <ScaleIcon className="h-6 w-6 text-blue-500 mr-2" />
              <CardTitle className="text-lg">Risk Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['Conservative', 'Moderate', 'Aggressive'].map((risk) => (
                <div key={risk} className="flex justify-between items-center">
                  <span className="text-sm">{risk}</span>
                  <span className="text-sm font-medium">
                    {portfolios.filter(p => p.risk_profile === risk).length}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center">
              <ChartPieIcon className="h-6 w-6 text-yellow-500 mr-2" />
              <CardTitle className="text-lg">Asset Allocation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {portfolios.length > 0 && portfolios[0].target_allocation.map((allocation) => (
                <div key={allocation.asset} className="flex justify-between items-center">
                  <span className="text-sm">{allocation.asset}</span>
                  <span className="text-sm font-medium">{allocation.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center">
              <ChartBarIcon className="h-6 w-6 text-purple-500 mr-2" />
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {portfolios.slice(0, 3).map((portfolio) => (
                <div key={portfolio.id} className="text-sm">
                  <p className="font-medium">{portfolio.name}</p>
                  <p className="text-gray-500">
                    Created: {new Date(portfolio.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {portfolios.map((portfolio) => (
          <Card key={portfolio.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                  <p className="text-sm text-gray-500">{portfolio.description}</p>
                </div>
                <Button variant="ghost" onClick={() => router.push(`/dashboard/portfolios/${portfolio.id}`)}>
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Risk Profile</span>
                  <span className="text-sm font-medium">{portfolio.risk_profile}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Daily Performance</span>
                    <span className={`text-sm font-medium ${
                      portfolio.performance?.daily !== undefined && portfolio.performance.daily > 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {portfolio.performance?.daily !== undefined ? `${portfolio.performance.daily > 0 ? '+' : ''}${portfolio.performance.daily.toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Weekly Performance</span>
                    <span className={`text-sm font-medium ${
                      portfolio.performance?.weekly !== undefined && portfolio.performance.weekly > 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {portfolio.performance?.weekly !== undefined ? `${portfolio.performance.weekly > 0 ? '+' : ''}${portfolio.performance.weekly.toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Monthly Performance</span>
                    <span className={`text-sm font-medium ${
                      portfolio.performance?.monthly !== undefined && portfolio.performance.monthly > 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {portfolio.performance?.monthly !== undefined ? `${portfolio.performance.monthly > 0 ? '+' : ''}${portfolio.performance.monthly.toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {portfolios.length === 0 && (
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