'use client';

import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

interface PortfolioResponse {
  portfolio: {
    totalValue: number;
    assetAllocation: Array<{
      asset: string;
      percentage: number;
    }>;
    riskScore: number;
    expectedReturn: number;
    volatility: number;
    sharpeRatio: number;
  };
  recommendations: Array<{
    type: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
  }>;
  output: string;
}

export default function CreatePortfolioPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PortfolioResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    age: '',
    income: '',
    goals: '',
    riskTolerance: 'moderate',
    timeHorizon: '',
    query: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/portfolio/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate portfolio recommendations');
      }

      const data = await response.json() as PortfolioResponse;
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          AI Portfolio Advisor
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Get personalized investment recommendations based on your profile
        </p>
      </div>

      {/* Main Query Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <textarea
              id="query"
              rows={2}
              value={formData.query}
              onChange={(e) => setFormData({ ...formData, query: e.target.value })}
              className="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
              placeholder="Ask about your portfolio strategy (e.g., 'What's the best asset allocation for my risk tolerance?')"
            />
          </div>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !formData.query.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              'Analyze'
            )}
          </button>
        </div>
      </div>

      {/* Profile Section - Collapsible */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-900">Your Profile</h2>
          <button
            type="button"
            className="text-sm text-emerald-600 hover:text-emerald-700"
            onClick={() => {
              const profileSection = document.getElementById('profile-section');
              if (profileSection) {
                profileSection.classList.toggle('hidden');
              }
            }}
          >
            Edit Profile
          </button>
        </div>

        <div id="profile-section" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-xs font-medium text-gray-700">
                Age
              </label>
              <input
                type="number"
                id="age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
                min="18"
                max="100"
              />
            </div>
            <div>
              <label htmlFor="income" className="block text-xs font-medium text-gray-700">
                Annual Income
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="income"
                  value={formData.income}
                  onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                  className="block w-full rounded-md border-gray-300 pl-7 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                  required
                  min="0"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="goals" className="block text-xs font-medium text-gray-700">
              Investment Goals
            </label>
            <input
              type="text"
              id="goals"
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="e.g., Retirement, House, Education"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="riskTolerance" className="block text-xs font-medium text-gray-700">
                Risk Tolerance
              </label>
              <select
                id="riskTolerance"
                value={formData.riskTolerance}
                onChange={(e) => setFormData({ ...formData, riskTolerance: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
            <div>
              <label htmlFor="timeHorizon" className="block text-xs font-medium text-gray-700">
                Time Horizon
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  id="timeHorizon"
                  value={formData.timeHorizon}
                  onChange={(e) => setFormData({ ...formData, timeHorizon: e.target.value })}
                  className="block w-full rounded-md border-gray-300 pl-4 pr-12 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                  required
                  min="1"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">years</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {error ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-red-100 mb-3">
              <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Error</h3>
            <p className="text-sm text-gray-500">{error}</p>
            {error.includes('ANTHROPIC_API_KEY') && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-700">
                  Please add your Anthropic API key to the `.env.local` file.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : result ? (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Analysis</h2>
            
            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Portfolio Value</h3>
                <p className="text-2xl font-bold text-gray-900">${result.portfolio.totalValue.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Risk Score</h3>
                <p className="text-2xl font-bold text-gray-900">{(result.portfolio.riskScore * 100).toFixed(0)}%</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Expected Return</h3>
                <p className="text-2xl font-bold text-gray-900">{(result.portfolio.expectedReturn * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Sharpe Ratio</h3>
                <p className="text-2xl font-bold text-gray-900">{result.portfolio.sharpeRatio.toFixed(2)}</p>
              </div>
            </div>

            {/* Synopsis Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Portfolio Synopsis</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {result.output}
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Allocation */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Asset Allocation</h3>
              <div className="space-y-4">
                {result.portfolio.assetAllocation.map((allocation, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-32 text-sm font-medium text-gray-700">{allocation.asset}</div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${allocation.percentage}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-sm font-medium text-gray-700">
                      {allocation.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
              <div className="space-y-4">
                {result.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      recommendation.priority === 'high'
                        ? 'border-red-200 bg-red-50'
                        : recommendation.priority === 'medium'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-green-200 bg-green-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{recommendation.type}</h4>
                        <p className="mt-1 text-sm text-gray-600">{recommendation.description}</p>
                        <p className="mt-2 text-xs text-gray-500">Impact: {recommendation.impact}</p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          recommendation.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : recommendation.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {recommendation.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
} 