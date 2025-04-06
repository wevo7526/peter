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

interface MarketInsight {
  symbol: string;
  type: 'technical' | 'fundamental' | 'sentiment';
  title: string;
  description: string;
  confidence: number;
  timestamp: string;
  indicators?: {
    name: string;
    value: number;
    signal: 'buy' | 'sell' | 'neutral';
  }[];
}

interface PortfolioMetrics {
  totalValue: number;
  dailyPnL: number;
  positions: {
    symbol: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    marketValue: number;
    unrealizedPnL: number;
    realizedPnL: number;
  }[];
  assetAllocation: {
    asset: string;
    percentage: number;
  }[];
  riskMetrics: {
    beta: number;
    alpha: number;
    sharpeRatio: number;
    volatility: number;
    maxDrawdown: number;
    correlation: number;
  };
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

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'neutral';
  timestamp: string;
}

interface MarketSentiment {
  symbol: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  sources: number;
  timestamp: string;
}

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics | null>(null);
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicator[]>([]);
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1D');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['AAPL', 'MSFT', 'GOOGL']);

  useEffect(() => {
    fetchInsights();
  }, [selectedTimeframe, selectedSymbols]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const [
        portfolioResponse,
        insightsResponse,
        trendsResponse,
        indicatorsResponse,
        sentimentResponse,
      ] = await Promise.all([
        fetch(`/api/market-data?type=portfolio&symbols=${selectedSymbols.join(',')}`),
        fetch(`/api/market-data?type=market-insights&symbols=${selectedSymbols.join(',')}`),
        fetch('/api/market-data?type=market-trends'),
        fetch(`/api/market-data?type=technical-indicators&symbols=${selectedSymbols.join(',')}`),
        fetch(`/api/market-data?type=market-sentiment&symbols=${selectedSymbols.join(',')}`),
      ]);

      if (!portfolioResponse.ok || !insightsResponse.ok || !trendsResponse.ok || 
          !indicatorsResponse.ok || !sentimentResponse.ok) {
        throw new Error('Failed to fetch market data');
      }

      const [portfolioData, insightsData, trendsData, indicatorsData, sentimentData] = await Promise.all([
        portfolioResponse.json(),
        insightsResponse.json(),
        trendsResponse.json(),
        indicatorsResponse.json(),
        sentimentResponse.json(),
      ]);

      setPortfolioMetrics(portfolioData);
      setMarketInsights(insightsData);
      setMarketTrends(trendsData);
      setTechnicalIndicators(indicatorsData.flat());
      setMarketSentiment(sentimentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
        <h1 className="text-2xl font-bold">Market Insights</h1>
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
            {marketSentiment.map((sentiment) => (
              <div key={sentiment.symbol} className="flex justify-between items-center">
                <span className="text-sm">{sentiment.symbol}</span>
                <span className={`text-sm ${
                  sentiment.sentiment === 'positive' ? 'text-green-500' :
                  sentiment.sentiment === 'negative' ? 'text-red-500' :
                  'text-gray-500'
                }`}>
                  {sentiment.sentiment}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Insights and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Technical Analysis</h2>
          <div className="space-y-4">
            {technicalIndicators.map((indicator, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{indicator.name}</h3>
                  <span className={`px-2 py-1 rounded text-sm ${
                    indicator.signal === 'buy' ? 'bg-green-100 text-green-800' :
                    indicator.signal === 'sell' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {indicator.signal.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Value: {indicator.value.toFixed(2)}</p>
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