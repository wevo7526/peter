import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// Define interfaces
interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'retirement' | 'education' | 'home' | 'travel' | 'emergency' | 'other';
  priority: 'high' | 'medium' | 'low';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category: 'housing' | 'transportation' | 'food' | 'utilities' | 'insurance' | 'healthcare' | 'savings' | 'entertainment' | 'other';
  period: 'monthly' | 'quarterly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

interface InvestmentStrategy {
  id: string;
  name: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  timeHorizon: 'short' | 'medium' | 'long';
  allocation: {
    stocks: number;
    bonds: number;
    cash: number;
    realEstate: number;
    crypto: number;
    other: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface FinancialPlan {
  id: string;
  userId: string;
  goals: FinancialGoal[];
  budgets: Budget[];
  strategies: InvestmentStrategy[];
  createdAt: string;
  updatedAt: string;
}

// In-memory storage
const financialPlansStore = new Map<string, FinancialPlan>();
const aiInteractionsStore = new Map<string, any[]>();

// Mock financial plan for demonstration
const mockFinancialPlan: FinancialPlan = {
  id: '1',
  userId: 'mock-user',
  goals: [
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 5000,
      targetDate: '2024-12-31',
      category: 'emergency',
      priority: 'high',
      notes: 'Build 6 months of expenses',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  budgets: [
    {
      id: '1',
      name: 'Monthly Budget',
      amount: 5000,
      spent: 3000,
      category: 'housing',
      period: 'monthly',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  strategies: [
    {
      id: '1',
      name: 'Balanced Portfolio',
      riskTolerance: 'moderate',
      timeHorizon: 'medium',
      allocation: {
        stocks: 60,
        bonds: 30,
        cash: 10,
        realEstate: 0,
        crypto: 0,
        other: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock rate limiting function
async function isRateLimited(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  return false; // Mock implementation - no rate limiting
}

// Mock AI interactions function
async function storeAIInteraction(userId: string, interaction: any): Promise<void> {
  const interactions = aiInteractionsStore.get(userId) || [];
  interactions.push(interaction);
  aiInteractionsStore.set(userId, interactions);
}

export async function GET(request: Request) {
  try {
    // Get session directly
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    
    // Check rate limiting - 30 requests per minute
    const isLimited = await isRateLimited(`planning:${userId}`, 30, 60);
    if (isLimited) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Get financial plan from in-memory store
    let financialPlan = financialPlansStore.get(userId);
    if (!financialPlan) {
      financialPlan = {
        ...mockFinancialPlan,
        userId,
      };
      financialPlansStore.set(userId, financialPlan);
    }
    
    return NextResponse.json({ financialPlan });
  } catch (error) {
    console.error('Error in planning GET route:', error);
    return NextResponse.json(
      { error: 'Failed to get financial plan' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get session directly
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    const body = await request.json();
    
    // Check rate limiting - 10 requests per minute
    const isLimited = await isRateLimited(`planning:save:${userId}`, 10, 60);
    if (isLimited) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Store the AI interaction
    await storeAIInteraction(userId, {
      type: 'planning',
      action: 'update',
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in planning POST route:', error);
    return NextResponse.json(
      { error: 'Failed to update financial plan' },
      { status: 500 }
    );
  }
} 