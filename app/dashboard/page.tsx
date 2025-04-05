'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PortfolioMetrics, RiskMetrics, AssetAllocation } from '@/app/services/portfolioAnalysis';
import { supabase } from '@/app/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<{
    portfolio: PortfolioMetrics;
    risk: RiskMetrics;
    allocation: AssetAllocation;
  } | null>(null);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {/* Add your dashboard content here */}
    </div>
  );
} 