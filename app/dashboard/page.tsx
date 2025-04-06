'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
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
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setPortfolios(data || []);
    } catch (err) {
      setPortfolios([]);
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
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={() => router.push('/dashboard/create')}>
          Create New Portfolio
        </Button>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-6 w-6 text-green-500 mr-2" />
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