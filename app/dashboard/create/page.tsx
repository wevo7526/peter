'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

interface PortfolioResponse {
  portfolio: {
    id: string;
    name: string;
    description: string;
    riskProfile: string;
    targetReturn: number;
    maxDrawdown: number;
    assetAllocation: {
      asset: string;
      percentage: number;
    }[];
  };
  message: string;
}

export default function CreatePortfolio() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const response = await fetch('/api/portfolio/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portfolio');
      }

      const data: PortfolioResponse = await response.json();
      router.push(`/dashboard/portfolio/${data.portfolio.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Portfolio Creation</h1>

      {/* Main Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 