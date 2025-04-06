'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, TrendingUp, Activity, BarChart2, AlertTriangle } from 'lucide-react';

interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: string;
  change: number;
  changePercent: number;
}

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'neutral';
}

interface MarketSentiment {
  symbol: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

interface SectorPerformance {
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

interface RiskMetrics {
  beta: number;
  alpha: number;
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
  correlation: number;
}

interface MarketInsight {
  type: 'technical' | 'fundamental' | 'sentiment';
  title: string;
  description: string;
  confidence: number;
  timestamp: string;
}

interface ResearchResponse {
  response: string;
  marketData: MarketData[];
  technicalIndicators: TechnicalIndicator[];
  sentiment: MarketSentiment[];
  sectorPerformance: SectorPerformance[];
  riskMetrics: RiskMetrics | null;
  marketInsights: MarketInsight[];
}

export default function ResearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [research, setResearch] = useState<ResearchResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  
  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (!session) {
          router.push('/auth');
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/auth');
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsAuthenticated(false);
        router.push('/auth');
      } else {
        setIsAuthenticated(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Authentication error');
      }

      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get research');
      }

      const data = await response.json();
      setResearch(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      if (err instanceof Error && err.message === 'Authentication error') {
        router.push('/auth');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Market Research</h1>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4">
        <Input
          placeholder="Enter your research query (e.g., 'Analyze AAPL and MSFT performance')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Research
            </>
          )}
        </Button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {research && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Market Data */}
          {research.marketData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Market Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {research.marketData.map((data) => (
                    <div key={data.symbol} className="flex justify-between items-center">
                      <span className="font-medium">{data.symbol}</span>
                      <div className="text-right">
                        <div className="font-semibold">${data.price.toFixed(2)}</div>
                        <div className={`text-sm ${data.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Indicators */}
          {research.technicalIndicators.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Technical Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {research.technicalIndicators.map((indicator) => (
                    <div key={indicator.name} className="flex justify-between items-center">
                      <span className="font-medium">{indicator.name}</span>
                      <div className="text-right">
                        <div className="font-semibold">{indicator.value.toFixed(2)}</div>
                        <div className={`text-sm ${
                          indicator.signal === 'buy' ? 'text-green-600' :
                          indicator.signal === 'sell' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {indicator.signal.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Market Sentiment */}
          {research.sentiment.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5" />
                  Market Sentiment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {research.sentiment.map((s) => (
                    <div key={s.symbol} className="flex justify-between items-center">
                      <span className="font-medium">{s.symbol}</span>
                      <div className="text-right">
                        <div className={`font-semibold ${
                          s.sentiment === 'positive' ? 'text-green-600' :
                          s.sentiment === 'negative' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {s.sentiment.toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Confidence: {(s.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Metrics */}
          {research.riskMetrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Beta</span>
                    <span className="font-semibold">{research.riskMetrics.beta.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Alpha</span>
                    <span className="font-semibold">{research.riskMetrics.alpha.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sharpe Ratio</span>
                    <span className="font-semibold">{research.riskMetrics.sharpeRatio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Volatility</span>
                    <span className="font-semibold">{research.riskMetrics.volatility.toFixed(2)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {research.response.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 