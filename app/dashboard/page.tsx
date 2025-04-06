'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  NewspaperIcon,
  BellIcon,
  ChartPieIcon,
  ScaleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { MarketDataService } from '@/app/services/marketData';

interface PortfolioPosition {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  realizedPnL: number;
}

interface PortfolioMetrics {
  totalValue: number;
  dailyPnL: number;
  positions: PortfolioPosition[];
  assetAllocation: {
    asset: string;
    percentage: number;
  }[];
  riskMetrics: {
    beta: number;
    alpha: number;
    sharpeRatio: number;
    volatility: number;
  };
}

interface MarketInsight {
  symbol: string;
  type: 'technical' | 'fundamental' | 'sentiment';
  title: string;
  description: string;
  confidence: number;
  timestamp: string;
}

interface MarketTrend {
  sector: string;
  performance: number;
  topStocks: Array<{
    symbol: string;
    performance: number;
  }>;
  bottomStocks: Array<{
    symbol: string;
    performance: number;
  }>;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics | null>(null);
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1D');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['AAPL', 'MSFT', 'GOOGL']);
  const marketDataService = new MarketDataService();

  useEffect(() => {
    fetchDashboardData();
    // Set up WebSocket connection for real-time updates
    marketDataService.connectToMarketData(selectedSymbols);
    return () => {
      marketDataService.disconnect();
    };
  }, [selectedTimeframe, selectedSymbols]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        portfolioResponse,
        insightsResponse,
        trendsResponse,
      ] = await Promise.all([
        fetch(`/api/market-data?type=portfolio&symbols=${selectedSymbols.join(',')}`),
        fetch(`/api/market-data?type=market-insights&symbols=${selectedSymbols.join(',')}`),
        fetch('/api/market-data?type=market-trends'),
      ]);

      if (!portfolioResponse.ok || !insightsResponse.ok || !trendsResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [portfolioData, insightsData, trendsData] = await Promise.all([
        portfolioResponse.json(),
        insightsResponse.json(),
        trendsResponse.json(),
      ]);

      setPortfolioMetrics(portfolioData);
      setMarketInsights(Array.isArray(insightsData) ? insightsData : []);
      setMarketTrends(Array.isArray(trendsData) ? trendsData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setMarketInsights([]);
      setMarketTrends([]);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          {['1D', '1W', '1M', '3M', '1Y'].map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe as any)}
              className={`px-3 py-1 rounded ${
                selectedTimeframe === timeframe
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-6 w-6 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold">Portfolio Value</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            ${portfolioMetrics?.totalValue.toLocaleString()}
          </p>
          <p className={`text-sm ${(portfolioMetrics?.dailyPnL ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {(portfolioMetrics?.dailyPnL ?? 0) >= 0 ? '+' : ''}{(portfolioMetrics?.dailyPnL ?? 0).toFixed(2)}%
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <ScaleIcon className="h-6 w-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold">Risk Metrics</h3>
          </div>
          <div className="mt-2">
            <p className="text-sm">Beta: {portfolioMetrics?.riskMetrics.beta.toFixed(2)}</p>
            <p className="text-sm">Alpha: {portfolioMetrics?.riskMetrics.alpha.toFixed(2)}</p>
            <p className="text-sm">Sharpe: {portfolioMetrics?.riskMetrics.sharpeRatio.toFixed(2)}</p>
            <p className="text-sm">Volatility: {((portfolioMetrics?.riskMetrics.volatility ?? 0) * 100).toFixed(2)}%</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <ChartPieIcon className="h-6 w-6 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold">Asset Allocation</h3>
          </div>
          <div className="mt-2">
            {portfolioMetrics?.assetAllocation.map((asset) => (
              <div key={asset.asset} className="flex justify-between items-center">
                <span className="text-sm">{asset.asset}</span>
                <span className="text-sm font-medium">{asset.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <SparklesIcon className="h-6 w-6 text-purple-500 mr-2" />
            <h3 className="text-lg font-semibold">Market Sentiment</h3>
          </div>
          <div className="mt-2">
            {Array.isArray(marketInsights) && marketInsights
              .filter(insight => insight.type === 'sentiment')
              .map((insight) => (
                <div key={insight.symbol} className="flex justify-between items-center">
                  <span className="text-sm">{insight.symbol}</span>
                  <span className={`text-sm ${
                    insight.title.toLowerCase().includes('positive') ? 'text-green-500' :
                    insight.title.toLowerCase().includes('negative') ? 'text-red-500' :
                    'text-gray-500'
                  }`}>
                    {insight.title}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Market Insights and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Market Insights</h2>
          <div className="space-y-4">
            {Array.isArray(marketInsights) && marketInsights.map((insight, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{insight.title}</h3>
                  <span className={`px-2 py-1 rounded text-sm ${
                    insight.type === 'technical' ? 'bg-blue-100 text-blue-800' :
                    insight.type === 'fundamental' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {insight.type}
                  </span>
                </div>
                <p className="text-gray-600 mt-2">{insight.description}</p>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${insight.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-500">
                    {Math.round(insight.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Sector Performance</h2>
          <div className="space-y-4">
            {marketTrends.map((trend, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{trend.sector}</h3>
                  <span className={`px-2 py-1 rounded text-sm ${
                    trend.performance >= 0 ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {trend.performance >= 0 ? '+' : ''}{trend.performance.toFixed(2)}%
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium">Top Performers:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {trend.topStocks.map((stock) => (
                      <span key={stock.symbol} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                        {stock.symbol} ({stock.performance.toFixed(2)}%)
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium">Bottom Performers:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {trend.bottomStocks.map((stock) => (
                      <span key={stock.symbol} className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                        {stock.symbol} ({stock.performance.toFixed(2)}%)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 