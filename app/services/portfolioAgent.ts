import { ChatAnthropic } from '@langchain/anthropic';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { DynamicTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';

// Define types
type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

interface RiskProfileInput {
  age: number;
  income: number;
  goals: string[];
  riskTolerance: RiskTolerance;
  timeHorizon: number;
  query?: string;
}

interface RiskProfileOutput {
  riskScore: number;
  recommendedAllocation: {
    stocks: number;
    bonds: number;
    cash: number;
  };
}

// Define the portfolio schema
const portfolioSchema = z.object({
  portfolio: z.object({
    totalValue: z.number(),
    assetAllocation: z.array(z.object({
      asset: z.string(),
      percentage: z.number().min(0).max(100)
    })),
    riskScore: z.number().min(0).max(1),
    expectedReturn: z.number(),
    volatility: z.number(),
    sharpeRatio: z.number()
  }),
  recommendations: z.array(z.object({
    type: z.string(),
    description: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    impact: z.string()
  }))
});

// Define tools
const analyzeRiskProfile = new DynamicTool({
  name: 'analyzeRiskProfile',
  description: 'Analyzes the user\'s risk profile based on their inputs',
  func: async (input: string): Promise<string> => {
    const parsedInput = JSON.parse(input) as RiskProfileInput;
    const riskScore = parsedInput.riskTolerance === 'conservative' ? 0.3 :
                      parsedInput.riskTolerance === 'moderate' ? 0.5 : 0.7;
    
    const output: RiskProfileOutput = {
      riskScore,
      recommendedAllocation: {
        stocks: parsedInput.riskTolerance === 'conservative' ? 40 :
                parsedInput.riskTolerance === 'moderate' ? 60 : 80,
        bonds: parsedInput.riskTolerance === 'conservative' ? 50 :
               parsedInput.riskTolerance === 'moderate' ? 30 : 15,
        cash: parsedInput.riskTolerance === 'conservative' ? 10 :
              parsedInput.riskTolerance === 'moderate' ? 10 : 5
      }
    };

    return JSON.stringify(output);
  }
});

const optimizePortfolio = new DynamicTool({
  name: 'optimizePortfolio',
  description: 'Optimizes the portfolio based on risk profile and market conditions',
  func: async (input: string): Promise<string> => {
    const { riskProfile, marketConditions } = JSON.parse(input);
    const profile = JSON.parse(riskProfile) as RiskProfileOutput;
    
    return JSON.stringify({
      totalValue: 100000,
      assetAllocation: [
        { asset: 'Stocks', percentage: profile.recommendedAllocation.stocks },
        { asset: 'Bonds', percentage: profile.recommendedAllocation.bonds },
        { asset: 'Cash', percentage: profile.recommendedAllocation.cash }
      ],
      expectedReturn: 0.08,
      volatility: 0.15,
      sharpeRatio: 0.5
    });
  }
});

const generateCharts = new DynamicTool({
  name: 'generateCharts',
  description: 'Generates visualization charts for the portfolio',
  func: async (input: string): Promise<string> => {
    const { portfolioData } = JSON.parse(input);
    return JSON.stringify({
      allocationChart: {
        type: 'pie',
        data: JSON.parse(portfolioData).assetAllocation
      },
      performanceChart: {
        type: 'line',
        data: {
          labels: ['1Y', '2Y', '3Y', '4Y', '5Y'],
          values: [100, 108, 116, 125, 135]
        }
      }
    });
  }
});

// Create the agent prompt
const createPrompt = () => {
  const systemMessage = `You are an expert portfolio manager AI assistant. Your task is to analyze the user's profile and create a comprehensive investment strategy.

User Profile:
- Age: {age}
- Annual Income: {income}
- Investment Goals: {goals}
- Risk Tolerance: {riskTolerance}
- Time Horizon: {timeHorizon} years

Please provide your response in two parts:

1. First, provide a detailed explanation of your investment strategy and recommendations, including:
- Overview of the investment strategy
- Rationale for asset allocation decisions
- Risk management approach
- Expected performance and considerations
- Key factors influencing the recommendations

2. Then, provide a JSON response with the following format:
{{
  "portfolio": {{
    "totalValue": number,
    "assetAllocation": [
      {{ "asset": string, "percentage": number }}
    ],
    "riskScore": number (between 0 and 1),
    "expectedReturn": number (as decimal, e.g., 0.08 for 8%),
    "volatility": number (as decimal, e.g., 0.15 for 15%),
    "sharpeRatio": number
  }},
  "recommendations": [
    {{
      "type": string,
      "description": string,
      "priority": "high" | "medium" | "low",
      "impact": string
    }}
  ]
}}

Important:
- Ensure all percentages in assetAllocation sum to 100
- RiskScore must be between 0 and 1 (e.g., 0.6 for 60% risk)
- ExpectedReturn and volatility should be decimals (e.g., 0.08 for 8%)
- Separate the text explanation from the JSON response with a clear line break`;

  return ChatPromptTemplate.fromMessages([
    ['system', systemMessage],
    new MessagesPlaceholder('agent_scratchpad'),
    ['human', '{input}']
  ]);
};

// Create the agent
export async function createPortfolioAgent() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured. Please add it to your .env.local file.');
  }

  const model = new ChatAnthropic({
    modelName: 'claude-3-opus-20240229',
    temperature: 0.7,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    maxTokens: 4096,
  });

  const tools = [analyzeRiskProfile, optimizePortfolio, generateCharts];
  const prompt = createPrompt();

  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
  });

  return agentExecutor;
}

// Generate portfolio recommendations
export async function generatePortfolioRecommendations(input: {
  age: number;
  income: number;
  goals: string;
  riskTolerance: RiskTolerance;
  timeHorizon: number;
  query?: string;
}) {
  try {
    const agent = await createPortfolioAgent();
    
    // Format the input for the prompt template
    const formattedInput = {
      age: input.age.toString(),
      income: input.income.toString(),
      goals: input.goals.split(',').map(goal => goal.trim()),
      riskTolerance: input.riskTolerance,
      timeHorizon: input.timeHorizon.toString(),
      input: input.query || 'Generate a portfolio recommendation based on my profile.'
    };

    const result = await agent.invoke(formattedInput);

    // Split the output into text explanation and JSON
    const parts = result.output.split(/\{[\s\S]*\}/);
    const textExplanation = parts[0].trim();
    const jsonMatch = result.output.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in the response');
    }

    // Parse and validate the result
    const parsedResult = portfolioSchema.parse(JSON.parse(jsonMatch[0]));
    
    // Return both the structured data and the text explanation
    return {
      ...parsedResult,
      output: textExplanation
    };
  } catch (error) {
    console.error('Error in generatePortfolioRecommendations:', error);
    throw error;
  }
} 