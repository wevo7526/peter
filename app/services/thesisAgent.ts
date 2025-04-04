import { ChatAnthropic } from '@langchain/anthropic';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { DynamicTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';

// Define the thesis schema
const thesisSchema = z.object({
  title: z.string(),
  summary: z.string(),
  keyPoints: z.array(z.string()),
  marketContext: z.object({
    currentTrends: z.array(z.string()),
    risks: z.array(z.string()),
    opportunities: z.array(z.string())
  }),
  portfolioImplications: z.object({
    recommendedActions: z.array(z.string()),
    timeline: z.string(),
    expectedOutcomes: z.array(z.string())
  }),
  supportingData: z.object({
    marketMetrics: z.record(z.number()),
    relevantIndicators: z.array(z.string())
  })
});

// Define tools
const analyzeMarketContext = new DynamicTool({
  name: 'analyzeMarketContext',
  description: 'Analyzes current market trends, risks, and opportunities',
  func: async (input: string): Promise<string> => {
    // This is a placeholder implementation
    return JSON.stringify({
      currentTrends: ['AI-driven growth', 'Sustainable investing'],
      risks: ['Market volatility', 'Regulatory changes'],
      opportunities: ['Emerging markets', 'Tech innovation']
    });
  }
});

const generatePortfolioImplications = new DynamicTool({
  name: 'generatePortfolioImplications',
  description: 'Generates portfolio implications and recommendations',
  func: async (input: string): Promise<string> => {
    // This is a placeholder implementation
    return JSON.stringify({
      recommendedActions: ['Increase tech exposure', 'Diversify into emerging markets'],
      timeline: '6-12 months',
      expectedOutcomes: ['Improved risk-adjusted returns', 'Better sector diversification']
    });
  }
});

// Create the agent prompt
const createPrompt = () => {
  const systemMessage = `You are an expert investment analyst AI assistant. Your task is to generate comprehensive investment theses based on user queries.

Please provide your response in two parts:

1. First, provide a detailed explanation of your investment thesis, including:
- Overview of the investment opportunity
- Key supporting arguments
- Market context and analysis
- Portfolio implications
- Supporting data and metrics

2. Then, provide a JSON response with the following format:
{{
  "title": string,
  "summary": string,
  "keyPoints": string[],
  "marketContext": {{
    "currentTrends": string[],
    "risks": string[],
    "opportunities": string[]
  }},
  "portfolioImplications": {{
    "recommendedActions": string[],
    "timeline": string,
    "expectedOutcomes": string[]
  }},
  "supportingData": {{
    "marketMetrics": Record<string, number>,
    "relevantIndicators": string[]
  }}
}}

Important:
- Ensure all arrays contain meaningful, specific points
- MarketMetrics should include relevant numerical data
- Separate the text explanation from the JSON response with a clear line break`;

  return ChatPromptTemplate.fromMessages([
    ['system', systemMessage],
    new MessagesPlaceholder('agent_scratchpad'),
    ['human', '{input}']
  ]);
};

// Create the agent
export async function createThesisAgent() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured. Please add it to your .env.local file.');
  }

  const model = new ChatAnthropic({
    modelName: 'claude-3-opus-20240229',
    temperature: 0.7,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    maxTokens: 4096,
  });

  const tools = [analyzeMarketContext, generatePortfolioImplications];
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

// Generate investment thesis
export async function generateInvestmentThesis(query: string) {
  try {
    const agent = await createThesisAgent();
    
    const result = await agent.invoke({
      input: `Generate an investment thesis for: ${query}`
    });

    // Split the output into text explanation and JSON
    const parts = result.output.split(/\{[\s\S]*\}/);
    const textExplanation = parts[0].trim();
    const jsonMatch = result.output.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in the response');
    }

    // Parse and validate the result
    const parsedResult = thesisSchema.parse(JSON.parse(jsonMatch[0]));
    
    // Return both the structured data and the text explanation
    return {
      ...parsedResult,
      output: textExplanation
    };
  } catch (error) {
    console.error('Error in generateInvestmentThesis:', error);
    throw error;
  }
} 