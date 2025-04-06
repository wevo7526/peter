import { createClient } from '@supabase/supabase-js';
import { MarketDataService } from './marketData';

interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  positions: PortfolioPosition[];
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
    allTime: number;
  };
}

interface PortfolioPosition {
  id: string;
  portfolio_id: string;
  symbol: string;
  quantity: number;
  average_price: number;
  current_price: number;
  market_value: number;
  unrealized_pnl: number;
  realized_pnl: number;
  last_updated: string;
}

interface RebalanceRecommendation {
  symbol: string;
  currentPercentage: number;
  targetPercentage: number;
  action: 'buy' | 'sell' | 'hold';
  quantity: number;
  estimatedCost: number;
}

export class PortfolioService {
  private supabase;
  private marketDataService: MarketDataService;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.marketDataService = new MarketDataService();
  }

  async createPortfolio(userId: string, name: string, description: string): Promise<Portfolio> {
    const { data: portfolio, error } = await this.supabase
      .from('portfolios')
      .insert({
        user_id: userId,
        name,
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create portfolio');
    }

    return {
      ...portfolio,
      positions: [],
      performance: {
        daily: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0,
        allTime: 0,
      },
    };
  }

  async getPortfolio(portfolioId: string): Promise<Portfolio> {
    const { data: portfolio, error: portfolioError } = await this.supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .single();

    if (portfolioError) {
      throw new Error('Failed to fetch portfolio');
    }

    const { data: positions, error: positionsError } = await this.supabase
      .from('portfolio_positions')
      .select('*')
      .eq('portfolio_id', portfolioId);

    if (positionsError) {
      throw new Error('Failed to fetch portfolio positions');
    }

    const performance = await this.calculatePortfolioPerformance(positions);

    return {
      ...portfolio,
      positions,
      performance,
    };
  }

  async addPosition(
    portfolioId: string,
    symbol: string,
    quantity: number,
    averagePrice: number
  ): Promise<PortfolioPosition> {
    const currentPrice = await this.getCurrentPrice(symbol);
    const marketValue = quantity * currentPrice;
    const unrealizedPnL = (currentPrice - averagePrice) * quantity;

    const { data: position, error } = await this.supabase
      .from('portfolio_positions')
      .insert({
        portfolio_id: portfolioId,
        symbol,
        quantity,
        average_price: averagePrice,
        current_price: currentPrice,
        market_value: marketValue,
        unrealized_pnl: unrealizedPnL,
        realized_pnl: 0,
        last_updated: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to add position');
    }

    return position;
  }

  async updatePosition(
    positionId: string,
    updates: Partial<PortfolioPosition>
  ): Promise<PortfolioPosition> {
    const { data: position, error } = await this.supabase
      .from('portfolio_positions')
      .update({
        ...updates,
        last_updated: new Date().toISOString(),
      })
      .eq('id', positionId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update position');
    }

    return position;
  }

  async getRebalanceRecommendations(portfolioId: string): Promise<RebalanceRecommendation[]> {
    const portfolio = await this.getPortfolio(portfolioId);
    const targetAllocation = await this.getTargetAllocation(portfolioId);
    
    return portfolio.positions.map(position => {
      const currentPercentage = (position.market_value / this.getTotalValue(portfolio)) * 100;
      const targetPercentage = targetAllocation[position.symbol] || 0;
      
      let action: 'buy' | 'sell' | 'hold' = 'hold';
      let quantity = 0;
      
      if (currentPercentage < targetPercentage) {
        action = 'buy';
        quantity = Math.floor((targetPercentage - currentPercentage) * this.getTotalValue(portfolio) / position.current_price);
      } else if (currentPercentage > targetPercentage) {
        action = 'sell';
        quantity = Math.floor((currentPercentage - targetPercentage) * this.getTotalValue(portfolio) / position.current_price);
      }

      return {
        symbol: position.symbol,
        currentPercentage,
        targetPercentage,
        action,
        quantity,
        estimatedCost: quantity * position.current_price,
      };
    });
  }

  private async getCurrentPrice(symbol: string): Promise<number> {
    // Implement price fetching from market data service
    return 0;
  }

  private async calculatePortfolioPerformance(positions: PortfolioPosition[]) {
    // Implement performance calculation logic
    return {
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0,
      allTime: 0,
    };
  }

  private async getTargetAllocation(portfolioId: string): Promise<Record<string, number>> {
    // Implement target allocation fetching from user preferences
    return {};
  }

  private getTotalValue(portfolio: Portfolio): number {
    return portfolio.positions.reduce((sum, pos) => sum + pos.market_value, 0);
  }
} 