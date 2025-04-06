'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

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

// Cache storage
const cache = new Map<string, CacheEntry<any>>();

// Mock data for fallback
const mockData = {
  portfolioMetrics: {
    totalValue: 100000,
    dailyPnL: 2.5,
    positions: [
      {
        symbol: 'AAPL',
        quantity: 10,
        averagePrice: 150,
        currentPrice: 175,
        marketValue: 1750,
        unrealizedPnL: 250,
        realizedPnL: 0,
      },
      {
        symbol: 'MSFT',
        quantity: 15,
        averagePrice: 280,
        currentPrice: 300,
        marketValue: 4500,
        unrealizedPnL: 300,
        realizedPnL: 0,
      },
    ],
    assetAllocation: [
      { asset: 'AAPL', percentage: 30 },
      { asset: 'MSFT', percentage: 70 },
    ],
    riskMetrics: {
      beta: 1.2,
      alpha: 0.5,
      sharpeRatio: 1.8,
      volatility: 0.15,
      maxDrawdown: 0.1,
      correlation: 0.7,
    },
  },
  marketInsights: [
    {
      symbol: 'AAPL',
      type: 'technical' as const,
      title: 'Strong Buy Signal',
      description: 'AAPL showing bullish momentum with RSI at 65 and MACD crossover.',
      confidence: 0.85,
      timestamp: new Date().toISOString(),
      indicators: [
        { name: 'RSI', value: 65, signal: 'buy' as const },
        { name: 'MACD', value: 2.5, signal: 'buy' as const },
      ],
    },
  ],
  marketTrends: [
    {
      sector: 'Technology',
      performance: 2.5,
      topStocks: [
        { symbol: 'NVDA', performance: 5.2 },
        { symbol: 'AMD', performance: 3.8 },
      ],
      bottomStocks: [
        { symbol: 'META', performance: -1.2 },
        { symbol: 'SNAP', performance: -2.5 },
      ],
    },
  ],
  technicalIndicators: [
    {
      name: 'RSI',
      value: 65,
      signal: 'buy' as const,
      timestamp: new Date().toISOString(),
    },
  ],
  marketSentiment: [
    {
      symbol: 'AAPL',
      sentiment: 'positive' as const,
      confidence: 0.85,
      sources: 5,
      timestamp: new Date().toISOString(),
    },
  ],
};

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

  const fetchWithCache = useCallback(async (url: string, cacheKey: string) => {
    try {
      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Update cache
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
      
      return data;
    } catch (err) {
      console.error(`Error fetching ${cacheKey}:`, err);
      // Return mock data as fallback
      return mockData[cacheKey as keyof typeof mockData];
    }
  }, []);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use mock data for now since API is not working
      setPortfolioMetrics(mockData.portfolioMetrics);
      setMarketInsights(mockData.marketInsights);
      setMarketTrends(mockData.marketTrends);
      setTechnicalIndicators(mockData.technicalIndicators);
      setMarketSentiment(mockData.marketSentiment);

      // Comment out API calls until they are fixed
      /*
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      const [
        portfolioData,
        insightsData,
        trendsData,
        indicatorsData,
        sentimentData,
      ] = await Promise.all([
        fetchWithCache(
          `/api/market-data?type=portfolio&symbols=${selectedSymbols.join(',')}`,
          'portfolioMetrics'
        ),
        delay(100).then(() => fetchWithCache(
          `/api/market-data?type=market-insights&symbols=${selectedSymbols.join(',')}`,
          'marketInsights'
        )),
        delay(200).then(() => fetchWithCache(
          '/api/market-data?type=market-trends',
          'marketTrends'
        )),
        delay(300).then(() => fetchWithCache(
          `/api/market-data?type=technical-indicators&symbols=${selectedSymbols.join(',')}`,
          'technicalIndicators'
        )),
        delay(400).then(() => fetchWithCache(
          `/api/market-data?type=market-sentiment&symbols=${selectedSymbols.join(',')}`,
          'marketSentiment'
        )),
      ]);

      setPortfolioMetrics(portfolioData);
      setMarketInsights(insightsData);
      setMarketTrends(trendsData);
      setTechnicalIndicators(indicatorsData.flat());
      setMarketSentiment(sentimentData);
      */
    } catch (err) {
      console.error('Error fetching insights:', err);
      // Use mock data as fallback
      setPortfolioMetrics(mockData.portfolioMetrics);
      setMarketInsights(mockData.marketInsights);
      setMarketTrends(mockData.marketTrends);
      setTechnicalIndicators(mockData.technicalIndicators);
      setMarketSentiment(mockData.marketSentiment);
    } finally {
      setLoading(false);
    }
  }, [selectedTimeframe, selectedSymbols, fetchWithCache]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

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
        <h1 className="text-2xl font-bold">Market Insights</h1>
        <div className="flex gap-2">
          {['1D', '1W', '1M', '3M', '1Y'].map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
              onClick={() => setSelectedTimeframe(timeframe as any)}
            >
              {timeframe}
            </Button>
          ))}
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-6 w-6 text-green-500 mr-2" />
              <CardTitle className="text-lg">Portfolio Value</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${portfolioMetrics?.totalValue.toLocaleString()}
            </p>
            <p className={`text-sm ${(portfolioMetrics?.dailyPnL ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {(portfolioMetrics?.dailyPnL ?? 0) >= 0 ? '+' : ''}{(portfolioMetrics?.dailyPnL ?? 0).toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center">
              <ScaleIcon className="h-6 w-6 text-blue-500 mr-2" />
              <CardTitle className="text-lg">Risk Metrics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">Beta: {portfolioMetrics?.riskMetrics.beta.toFixed(2)}</p>
              <p className="text-sm">Alpha: {portfolioMetrics?.riskMetrics.alpha.toFixed(2)}</p>
              <p className="text-sm">Sharpe: {portfolioMetrics?.riskMetrics.sharpeRatio.toFixed(2)}</p>
              <p className="text-sm">Volatility: {((portfolioMetrics?.riskMetrics.volatility ?? 0) * 100).toFixed(2)}%</p>
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
              {portfolioMetrics?.assetAllocation.map((asset) => (
                <div key={asset.asset} className="flex justify-between items-center">
                  <span className="text-sm">{asset.asset}</span>
                  <span className="text-sm font-medium">{asset.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center">
              <SparklesIcon className="h-6 w-6 text-purple-500 mr-2" />
              <CardTitle className="text-lg">Market Sentiment</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
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
          </CardContent>
        </Card>
      </div>

      {/* Market Insights and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Technical Analysis</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sector Performance</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 