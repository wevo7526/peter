import { createClient } from '@supabase/supabase-js';

interface PolygonConfig {
  apiKey: string;
  baseUrl: string;
}

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
  timestamp: string;
}

interface MarketSentiment {
  symbol: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  sources: number;
  timestamp: string;
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

interface PolygonQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

export class MarketDataService {
  private polygon: PolygonConfig;
  public supabase: any;
  private ws: WebSocket | null = null;

  constructor() {
    this.polygon = {
      apiKey: process.env.POLYGON_API_KEY!,
      baseUrl: 'https://api.polygon.io/v2',
    };
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async connectToMarketData(symbols: string[]) {
    // Connect to Polygon.io WebSocket
    this.ws = new WebSocket(`wss://delayed.polygon.io/stocks`);

    this.ws.onopen = () => {
      // Subscribe to symbols
      const subscribeMessage = {
        action: 'subscribe',
        params: `T.${symbols.join(',T.')}`,
        apiKey: this.polygon.apiKey,
      };
      this.ws?.send(JSON.stringify(subscribeMessage));
    };

    this.ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.ev === 'T') {
        const quote: PolygonQuote = {
          symbol: data.sym,
          price: data.p,
          change: data.c,
          changePercent: data.cp,
          volume: data.v,
          timestamp: data.t,
        };
        await this.updateMarketData(quote);
      }
    };
  }

  private async updateMarketData(data: PolygonQuote) {
    // Store market data in Supabase
    const { error } = await this.supabase
      .from('market_data')
      .upsert({
        symbol: data.symbol,
        price: data.price,
        change: data.change,
        change_percent: data.changePercent,
        volume: data.volume,
        timestamp: new Date(data.timestamp).toISOString(),
      });

    if (error) {
      console.error('Error updating market data:', error);
    }
  }

  async getPortfolioMetrics(symbols: string[]) {
    try {
      const realTimeData = await this.getRealTimeData(symbols);
      const riskMetrics = await this.calculateRiskMetrics(symbols);

      return {
        totalValue: realTimeData.reduce((sum: number, pos: MarketData) => sum + pos.price, 0),
        dailyPnL: realTimeData.reduce((sum: number, pos: MarketData) => sum + pos.changePercent, 0) / symbols.length,
        positions: realTimeData.map(data => ({
          symbol: data.symbol,
          quantity: 0, // This should come from the user's portfolio
          averagePrice: 0, // This should come from the user's portfolio
          currentPrice: data.price,
          marketValue: 0, // This should come from the user's portfolio
          unrealizedPnL: data.changePercent,
          realizedPnL: 0, // This should come from the user's portfolio
        })),
        assetAllocation: [], // This should come from the user's portfolio
        riskMetrics,
      };
    } catch (error) {
      console.error('Error getting portfolio metrics:', error);
      throw error;
    }
  }

  async getRealTimeData(symbols: string[]): Promise<MarketData[]> {
    try {
      const response = await fetch(
        `${this.polygon.baseUrl}/v2/aggs/ticker/AAPL/range/1/day/2023-01-09/2023-01-09?apiKey=${this.polygon.apiKey}`
      );
      const data = await response.json();

      if (!data.results || !Array.isArray(data.results)) {
        console.log('No results found in real-time data response');
        // Return mock data for development
        return symbols.map(symbol => ({
          symbol,
          price: Math.random() * 1000,
          volume: Math.floor(Math.random() * 1000000),
          timestamp: new Date().toISOString(),
          change: Math.random() * 10 - 5,
          changePercent: Math.random() * 2 - 1,
        }));
      }

      return data.results.map((result: any) => ({
        symbol: result.symbol,
        price: result.c,
        volume: result.v,
        timestamp: new Date(result.t).toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      // Return mock data on error
      return symbols.map(symbol => ({
        symbol,
        price: Math.random() * 1000,
        volume: Math.floor(Math.random() * 1000000),
        timestamp: new Date().toISOString(),
        change: Math.random() * 10 - 5,
        changePercent: Math.random() * 2 - 1,
      }));
    }
  }

  async getHistoricalData(symbol: string, timeframe: string = '1D'): Promise<MarketData[]> {
    try {
      const response = await fetch(
        `${this.polygon.baseUrl}/v2/aggs/ticker/${symbol}/range/1/day/2023-01-09/2023-01-09?apiKey=${this.polygon.apiKey}`
      );
      const data = await response.json();

      if (!data.results || !Array.isArray(data.results)) {
        console.log(`No results found in historical data response for ${symbol}`);
        // Return mock data for development
        return Array(30).fill(null).map((_, i) => ({
          symbol,
          price: Math.random() * 1000,
          volume: Math.floor(Math.random() * 1000000),
          timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          change: Math.random() * 10 - 5,
          changePercent: Math.random() * 2 - 1,
        }));
      }

      return data.results.map((result: any) => ({
        symbol: result.symbol,
        price: result.c,
        volume: result.v,
        timestamp: new Date(result.t).toISOString(),
      }));
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      // Return mock data on error
      return Array(30).fill(null).map((_, i) => ({
        symbol,
        price: Math.random() * 1000,
        volume: Math.floor(Math.random() * 1000000),
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        change: Math.random() * 10 - 5,
        changePercent: Math.random() * 2 - 1,
      }));
    }
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicator[]> {
    try {
      const historicalData = await this.getHistoricalData(symbol);
      if (!historicalData.length) {
        console.log(`No historical data found for technical indicators for ${symbol}`);
        // Return mock data for development
        return [
          {
            name: 'SMA',
            value: Math.random() * 100,
            signal: Math.random() > 0.5 ? 'buy' : 'sell',
            timestamp: new Date().toISOString(),
          },
          {
            name: 'RSI',
            value: Math.random() * 100,
            signal: Math.random() > 0.5 ? 'buy' : 'sell',
            timestamp: new Date().toISOString(),
          },
        ];
      }

      const prices = historicalData.map(d => d.price);
      const sma = await this.calculateSMA(symbol, 20);
      const rsi = await this.calculateRSI(symbol);

      return [
        {
          name: 'SMA',
          value: sma,
          signal: prices[prices.length - 1] > sma ? 'buy' : 'sell',
          timestamp: new Date().toISOString(),
        },
        {
          name: 'RSI',
          value: rsi,
          signal: rsi > 70 ? 'sell' : rsi < 30 ? 'buy' : 'neutral',
          timestamp: new Date().toISOString(),
        },
      ];
    } catch (error) {
      console.error(`Error calculating technical indicators for ${symbol}:`, error);
      // Return mock data on error
      return [
        {
          name: 'SMA',
          value: Math.random() * 100,
          signal: Math.random() > 0.5 ? 'buy' : 'sell',
          timestamp: new Date().toISOString(),
        },
        {
          name: 'RSI',
          value: Math.random() * 100,
          signal: Math.random() > 0.5 ? 'buy' : 'sell',
          timestamp: new Date().toISOString(),
        },
      ];
    }
  }

  async getMarketSentiment(symbols: string[]): Promise<MarketSentiment[]> {
    try {
      const response = await fetch(
        `${this.polygon.baseUrl}/v2/reference/news?apiKey=${this.polygon.apiKey}`
      );
      const data = await response.json();

      if (!data.results || !Array.isArray(data.results)) {
        console.log('No results found in market sentiment response');
        // Return mock data for development
        return symbols.map(symbol => ({
          symbol,
          sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
          confidence: Math.random(),
          sources: Math.floor(Math.random() * 5) + 1,
          timestamp: new Date().toISOString(),
        }));
      }

      return data.results.map((result: any) => ({
        symbol: result.symbols?.[0] || 'UNKNOWN',
        sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
        confidence: Math.random(),
        sources: Math.floor(Math.random() * 5) + 1,
        timestamp: new Date(result.published_utc).toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching market sentiment:', error);
      // Return mock data on error
      return symbols.map(symbol => ({
        symbol,
        sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
        confidence: Math.random(),
        sources: Math.floor(Math.random() * 5) + 1,
        timestamp: new Date().toISOString(),
      }));
    }
  }

  async getSectorPerformance(): Promise<SectorPerformance[]> {
    try {
      const response = await fetch(
        `${this.polygon.baseUrl}/v2/reference/sectors?apiKey=${this.polygon.apiKey}`
      );
      const data = await response.json();

      if (!data.results || !Array.isArray(data.results)) {
        console.log('No results found in sector performance response');
        // Return mock data for development
        return [
          { 
            sector: 'Technology', 
            performance: Math.random() * 10 - 5,
            topStocks: [{ symbol: 'AAPL', performance: 5.2 }, { symbol: 'MSFT', performance: 4.8 }],
            bottomStocks: [{ symbol: 'INTC', performance: -2.1 }, { symbol: 'AMD', performance: -1.8 }]
          },
          { 
            sector: 'Finance', 
            performance: Math.random() * 10 - 5,
            topStocks: [{ symbol: 'JPM', performance: 3.5 }, { symbol: 'BAC', performance: 3.2 }],
            bottomStocks: [{ symbol: 'GS', performance: -1.5 }, { symbol: 'MS', performance: -1.2 }]
          },
          { 
            sector: 'Healthcare', 
            performance: Math.random() * 10 - 5,
            topStocks: [{ symbol: 'JNJ', performance: 4.1 }, { symbol: 'PFE', performance: 3.9 }],
            bottomStocks: [{ symbol: 'ABBV', performance: -2.3 }, { symbol: 'BMY', performance: -1.9 }]
          },
        ];
      }

      return data.results.map((result: any) => ({
        sector: result.name,
        performance: Math.random() * 10 - 5, // Mock performance data
      }));
    } catch (error) {
      console.error('Error fetching sector performance:', error);
      // Return mock data on error
      return [
        { 
          sector: 'Technology', 
          performance: Math.random() * 10 - 5,
          topStocks: [{ symbol: 'AAPL', performance: 5.2 }, { symbol: 'MSFT', performance: 4.8 }],
          bottomStocks: [{ symbol: 'INTC', performance: -2.1 }, { symbol: 'AMD', performance: -1.8 }]
        },
        { 
          sector: 'Finance', 
          performance: Math.random() * 10 - 5,
          topStocks: [{ symbol: 'JPM', performance: 3.5 }, { symbol: 'BAC', performance: 3.2 }],
          bottomStocks: [{ symbol: 'GS', performance: -1.5 }, { symbol: 'MS', performance: -1.2 }]
        },
        { 
          sector: 'Healthcare', 
          performance: Math.random() * 10 - 5,
          topStocks: [{ symbol: 'JNJ', performance: 4.1 }, { symbol: 'PFE', performance: 3.9 }],
          bottomStocks: [{ symbol: 'ABBV', performance: -2.3 }, { symbol: 'BMY', performance: -1.9 }]
        },
      ];
    }
  }

  async calculateRiskMetrics(symbols: string[]): Promise<RiskMetrics> {
    try {
      // Fetch historical data for all symbols
      const historicalData = await Promise.all(
        symbols.map(symbol => this.getHistoricalData(symbol, '1y'))
      );

      // Calculate risk metrics
      const beta = this.calculateBeta(historicalData);
      const alpha = this.calculateAlpha(historicalData);
      const sharpeRatio = this.calculateSharpeRatio(historicalData);
      const volatility = this.calculateVolatility(historicalData);
      const maxDrawdown = this.calculateMaxDrawdown(historicalData);
      const correlation = this.calculateCorrelation(historicalData);

      return {
        beta,
        alpha,
        sharpeRatio,
        volatility,
        maxDrawdown,
        correlation,
      };
    } catch (error) {
      console.error('Error calculating risk metrics:', error);
      throw error;
    }
  }

  private async calculateSMA(symbol: string, period: number): Promise<number> {
    try {
      const data = await this.getHistoricalData(symbol, `${period}d`);
      if (!data.length) return 0;
      const sum = data.reduce((acc: number, curr: MarketData) => acc + curr.price, 0);
      return sum / period;
    } catch (error) {
      console.error('Error calculating SMA:', error);
      return 0;
    }
  }

  private async calculateRSI(symbol: string): Promise<number> {
    const data = await this.getHistoricalData(symbol, '14d');
    // Implement RSI calculation
    return 50; // Placeholder
  }

  private analyzeSentiment(news: any[]): { type: 'positive' | 'negative' | 'neutral'; confidence: number } {
    // Implement sentiment analysis
    return { type: 'neutral', confidence: 0.5 };
  }

  private getSectorName(symbol: string): string {
    const sectors: { [key: string]: string } = {
      'XLK': 'Technology',
      'XLV': 'Healthcare',
      'XLF': 'Financial',
      'XLE': 'Energy',
      'XLI': 'Industrial',
    };
    return sectors[symbol] || symbol;
  }

  private async getTopStocksInSector(sector: string): Promise<Array<{ symbol: string; performance: number }>> {
    // Implement sector stock fetching
    return [];
  }

  private async getBottomStocksInSector(sector: string): Promise<Array<{ symbol: string; performance: number }>> {
    // Implement sector stock fetching
    return [];
  }

  private calculateBeta(historicalData: any[]): number {
    // Implement beta calculation
    return 1.0;
  }

  private calculateAlpha(historicalData: any[]): number {
    // Implement alpha calculation
    return 0.0;
  }

  private calculateSharpeRatio(historicalData: any[]): number {
    // Implement Sharpe ratio calculation
    return 0.0;
  }

  private calculateVolatility(historicalData: any[]): number {
    // Implement volatility calculation
    return 0.0;
  }

  private calculateMaxDrawdown(historicalData: any[]): number {
    // Implement max drawdown calculation
    return 0.0;
  }

  private calculateCorrelation(historicalData: any[]): number {
    // Implement correlation calculation
    return 0.0;
  }

  async getMarketInsights(symbols: string[]) {
    const marketData = await Promise.all(
      symbols.map(symbol => this.fetchMarketData(symbol))
    );

    const newsData = await this.fetchNewsData(symbols);
    const economicData = await this.fetchEconomicData();

    return {
      marketData,
      newsData,
      economicData,
    };
  }

  private async fetchMarketData(symbol: string) {
    try {
      const response = await fetch(
        `${this.polygon.baseUrl}/aggs/ticker/${symbol}/prev?apiKey=${this.polygon.apiKey}`
      );
      const data = await response.json();
      
      if (data.results && data.results[0]) {
        return {
          symbol,
          price: data.results[0].c,
          change: data.results[0].c - data.results[0].o,
          changePercent: ((data.results[0].c - data.results[0].o) / data.results[0].o) * 100,
          volume: data.results[0].v,
          timestamp: new Date(data.results[0].t).toISOString(),
        };
      }
    } catch (error) {
      console.error(`Error fetching market data for ${symbol}:`, error);
    }
    return {};
  }

  private async fetchNewsData(symbols: string[]) {
    try {
      const response = await fetch(
        `${this.polygon.baseUrl}/reference/news?ticker=${symbols.join(',')}&apiKey=${this.polygon.apiKey}`
      );
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching news data:', error);
      return [];
    }
  }

  private async fetchEconomicData() {
    // Implement economic data fetching
    return {};
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
} 