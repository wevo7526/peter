'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';
import type { PortfolioMetrics, RiskMetrics, AssetAllocation } from '@/app/services/portfolioAnalysis';

interface PortfolioAnalysis {
  metrics: PortfolioMetrics;
  riskMetrics: RiskMetrics;
  allocation: AssetAllocation[];
}

export default function DashboardPage() {
  const { user } = useUser();
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch('/api/portfolio/analysis');
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio analysis');
        }
        const data = await response.json();
        setAnalysis(data);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load portfolio analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-red-500 text-center">
          <p className="text-xl mb-4">Error</p>
          <p>{error || 'No portfolio data available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Your AI-powered portfolio insights and strategy
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Portfolio Value Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Portfolio Value</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            ${analysis.metrics.totalValue.toLocaleString()}
          </p>
          <p className={`mt-1 text-sm ${analysis.metrics.dailyChangePercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {analysis.metrics.dailyChangePercent >= 0 ? '+' : ''}{analysis.metrics.dailyChangePercent.toFixed(2)}% today
          </p>
        </div>

        {/* Risk Score Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Risk Score</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {(analysis.riskMetrics.riskScore * 100).toFixed(0)}%
          </p>
          <p className="mt-1 text-sm text-gray-500">Portfolio risk assessment</p>
        </div>

        {/* Performance Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">YTD Return</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {(analysis.metrics.yearlyReturn * 100).toFixed(1)}%
          </p>
          <p className="mt-1 text-sm text-gray-500">Annual performance</p>
        </div>
      </div>

      {/* Asset Allocation Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Asset Allocation</h2>
          <div className="mt-4 space-y-4">
            {analysis.allocation.map((asset) => (
              <div key={asset.asset} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{asset.asset}</p>
                  <p className="text-sm text-gray-500">{asset.percentage}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${asset.value.toLocaleString()}
                  </p>
                  <p className={`text-sm ${asset.dailyChangePercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {asset.dailyChangePercent >= 0 ? '+' : ''}{asset.dailyChangePercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Metrics Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Risk Metrics</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Max Drawdown</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {(analysis.riskMetrics.maxDrawdown * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">VaR (95%)</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {(analysis.riskMetrics.var95 * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Sharpe Ratio</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {analysis.metrics.sharpeRatio.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Beta</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {analysis.metrics.beta.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 