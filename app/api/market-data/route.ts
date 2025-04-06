import { NextResponse } from 'next/server';
import { MarketDataService } from '@/app/services/marketData';

// Mock data for testing - replace with actual Polygon.io API calls
const mockPortfolioMetrics = {
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
  },
};

const mockMarketInsights = [
  {
    symbol: 'AAPL',
    type: 'technical',
    title: 'Strong Buy Signal',
    description: 'AAPL showing bullish momentum with RSI at 65 and MACD crossover.',
    confidence: 0.85,
    timestamp: new Date().toISOString(),
    indicators: [
      { name: 'RSI', value: 65, signal: 'buy' },
      { name: 'MACD', value: 2.5, signal: 'buy' },
    ],
  },
  {
    symbol: 'MSFT',
    type: 'fundamental',
    title: 'Earnings Beat Expected',
    description: 'Q4 earnings exceeded expectations with strong cloud growth.',
    confidence: 0.92,
    timestamp: new Date().toISOString(),
  },
];

const mockMarketTrends = [
  {
    sector: 'Technology',
    trend: 'up',
    strength: 0.85,
    topPerformers: ['NVDA', 'AMD', 'INTC'],
    bottomPerformers: ['META', 'SNAP', 'TWTR'],
  },
  {
    sector: 'Healthcare',
    trend: 'sideways',
    strength: 0.45,
    topPerformers: ['JNJ', 'PFE'],
    bottomPerformers: ['MRNA', 'BNTX'],
  },
];

export async function GET(request: Request) {
  try {
    const marketDataService = new MarketDataService();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const symbols = searchParams.get('symbols')?.split(',') || [];

    switch (type) {
      case 'portfolio':
        const portfolioMetrics = await marketDataService.getPortfolioMetrics(symbols);
        return NextResponse.json(portfolioMetrics);

      case 'market-insights':
        const marketInsights = await marketDataService.getMarketInsights(symbols);
        return NextResponse.json(marketInsights);

      case 'market-trends':
        const marketTrends = await marketDataService.getSectorPerformance();
        return NextResponse.json(marketTrends);

      case 'technical-indicators':
        const technicalIndicators = await Promise.all(
          symbols.map(symbol => marketDataService.getTechnicalIndicators(symbol))
        );
        return NextResponse.json(technicalIndicators);

      case 'market-sentiment':
        const marketSentiment = await Promise.all(
          symbols.map(symbol => marketDataService.getMarketSentiment(symbol))
        );
        return NextResponse.json(marketSentiment);

      case 'risk-metrics':
        const riskMetrics = await marketDataService.calculateRiskMetrics(symbols);
        return NextResponse.json(riskMetrics);

      default:
        return NextResponse.json(
          { error: 'Invalid request type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Market data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const marketDataService = new MarketDataService();
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'watchlist':
        // Update user's watchlist
        const { error: watchlistError } = await marketDataService.supabase
          .from('user_watchlists')
          .upsert({
            user_id: data.userId,
            symbols: data.symbols,
            updated_at: new Date().toISOString(),
          });

        if (watchlistError) {
          throw watchlistError;
        }

        return NextResponse.json({ success: true });

      case 'alerts':
        // Create or update price alerts
        const { error: alertsError } = await marketDataService.supabase
          .from('price_alerts')
          .upsert(
            data.alerts.map((alert: any) => ({
              user_id: data.userId,
              symbol: alert.symbol,
              price: alert.price,
              condition: alert.condition,
              status: 'active',
              created_at: new Date().toISOString(),
            }))
          );

        if (alertsError) {
          throw alertsError;
        }

        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: 'Invalid request type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Market data update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 