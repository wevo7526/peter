'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface AssetAllocation {
  asset: string;
  percentage: number;
}

interface PortfolioResponse {
  portfolio: {
    id: string;
    name: string;
    description: string;
    riskProfile: string;
    targetReturn: number;
    maxDrawdown: number;
    assetAllocation: AssetAllocation[];
  };
  message: string;
}

export default function CreatePortfolio() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    income: '',
    goals: '',
    riskTolerance: 'moderate',
    timeHorizon: '',
    query: '',
  });
  const [generatedPortfolio, setGeneratedPortfolio] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/portfolio/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          age: parseInt(formData.age),
          income: parseInt(formData.income),
          goals: formData.goals,
          riskTolerance: formData.riskTolerance,
          timeHorizon: parseInt(formData.timeHorizon),
          input: formData.query,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Portfolio generation error response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.error || 'Failed to generate portfolio');
      }

      const data = await response.json();
      console.log('Generated portfolio data:', data);
      setGeneratedPortfolio(data);
      setShowResults(true);
    } catch (err) {
      console.error('Portfolio generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate portfolio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreatePortfolio = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Not authenticated');
      }

      // Create the portfolio with the generated data
      const portfolioData = {
        name: 'My Investment Portfolio',
        description: formData.query || 'A diversified investment portfolio',
        positions: [],
        risk_profile: formData.riskTolerance,
        target_allocation: generatedPortfolio.portfolio.assetAllocation.map((item: AssetAllocation) => ({
          asset: item.asset,
          percentage: item.percentage
        })),
        total_value: generatedPortfolio.portfolio.totalValue || 0,
        expected_return: generatedPortfolio.portfolio.expectedReturn || 0,
        volatility: generatedPortfolio.portfolio.volatility || 0,
        sharpe_ratio: generatedPortfolio.portfolio.sharpeRatio || 0,
        recommendations: generatedPortfolio.recommendations || [],
        performance: {
          daily: 0,
          weekly: 0,
          monthly: 0,
          yearly: 0,
          allTime: 0
        }
      };

      console.log('Sending portfolio data:', portfolioData);

      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(portfolioData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Portfolio creation error:', responseData);
        throw new Error(responseData.error || 'Failed to create portfolio');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/portfolio/${responseData.id}`);
      }, 1500);
    } catch (err) {
      console.error('Portfolio creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create portfolio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Portfolio</h1>

      {!showResults ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Query Section */}
          <div>
            <label htmlFor="query" className="block text-lg font-medium text-gray-900 mb-2">
              What would you like to know about your portfolio?
            </label>
            <textarea
              id="query"
              name="query"
              value={formData.query}
              onChange={handleChange}
              placeholder="Ask about your portfolio strategy (e.g., 'What's the best asset allocation for my risk tolerance?')"
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-lg"
              disabled={loading}
            />
          </div>

          {/* Profile Section */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                  Your Age
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    placeholder="Enter your current age"
                    required
                    min="18"
                    max="100"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="income" className="block text-sm font-medium text-gray-700">
                  Annual Income
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    id="income"
                    name="income"
                    value={formData.income}
                    onChange={handleChange}
                    className="block w-full pl-7 pr-12 py-2.5 text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    placeholder="Enter your annual income"
                    required
                    min="0"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">USD</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="riskTolerance" className="block text-sm font-medium text-gray-700">
                  Risk Tolerance
                </label>
                <div className="relative">
                  <select
                    id="riskTolerance"
                    name="riskTolerance"
                    value={formData.riskTolerance}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 appearance-none"
                  >
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>
                    Low Risk
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
                    Moderate
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                    High Risk
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      formData.riskTolerance === 'conservative'
                        ? 'bg-emerald-500 w-1/3'
                        : formData.riskTolerance === 'moderate'
                        ? 'bg-yellow-500 w-2/3'
                        : 'bg-red-500 w-full'
                    }`}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="timeHorizon" className="block text-sm font-medium text-gray-700">
                  Investment Time Horizon
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="timeHorizon"
                    name="timeHorizon"
                    value={formData.timeHorizon}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    placeholder="How long do you plan to invest?"
                    required
                    min="1"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label htmlFor="goals" className="block text-sm font-medium text-gray-700">
                  Investment Goals
                </label>
                <textarea
                  id="goals"
                  name="goals"
                  rows={3}
                  value={formData.goals}
                  onChange={handleChange}
                  className="block w-full px-4 py-2.5 text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  placeholder="Describe your investment goals (e.g., Retirement planning, buying a house, children's education)"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-8">
            <button
              type="submit"
              disabled={loading || !formData.query.trim()}
              className="inline-flex items-center px-8 py-3.5 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="font-medium">Analyzing Portfolio...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="font-medium">Generate Portfolio Strategy</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Generated Portfolio</h2>
            <Button onClick={() => setShowResults(false)}>Generate Another</Button>
          </div>

          <div className="prose max-w-none">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Investment Strategy</h3>
              <div className="whitespace-pre-wrap">{generatedPortfolio?.output?.split('JSON Response:')[0]}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Total Value</h4>
                      <p className="text-2xl font-bold">${generatedPortfolio?.portfolio?.totalValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Risk Score</h4>
                      <p className="text-2xl font-bold">{(generatedPortfolio?.portfolio?.riskScore * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Expected Return</h4>
                      <p className="text-2xl font-bold">{(generatedPortfolio?.portfolio?.expectedReturn * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Volatility</h4>
                      <p className="text-2xl font-bold">{(generatedPortfolio?.portfolio?.volatility * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Sharpe Ratio</h4>
                      <p className="text-2xl font-bold">{generatedPortfolio?.portfolio?.sharpeRatio.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Asset Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generatedPortfolio?.portfolio?.assetAllocation.map((allocation: any) => (
                      <div key={allocation.asset}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{allocation.asset}</span>
                          <span className="text-sm font-medium">{allocation.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${allocation.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generatedPortfolio?.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="border-b pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{rec.type}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{rec.description}</p>
                      <p className="text-sm text-gray-500">Impact: {rec.impact}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 space-y-4">
              {error && (
                <div className="p-4 bg-red-50 text-red-800 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 bg-green-50 text-green-800 rounded-lg">
                  Portfolio saved successfully! Redirecting...
                </div>
              )}
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowResults(false)}
                  disabled={loading}
                >
                  Generate Another
                </Button>
                <Button
                  onClick={handleCreatePortfolio}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Save Portfolio
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 