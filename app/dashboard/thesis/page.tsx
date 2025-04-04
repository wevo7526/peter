'use client';

import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

interface InvestmentThesis {
  title: string;
  summary: string;
  keyPoints: string[];
  marketContext: {
    currentTrends: string[];
    risks: string[];
    opportunities: string[];
  };
  portfolioImplications: {
    recommendedActions: string[];
    timeline: string;
    expectedOutcomes: string[];
  };
  supportingData: {
    marketMetrics: Record<string, number | string>;
    relevantIndicators: string[];
  };
}

export default function ThesisPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [thesis, setThesis] = useState<InvestmentThesis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const handleGenerateThesis = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/thesis/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate investment thesis');
      }

      const data = await response.json();
      setThesis(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Investment Thesis Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Generate comprehensive investment theses powered by AI. Our advanced analysis engine evaluates market trends, 
            competitive dynamics, and growth catalysts to provide detailed insights and actionable recommendations. 
            Perfect for investors seeking data-driven investment strategies backed by thorough market research.
          </p>
        </div>

        {/* Query Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="block w-full rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2"
                placeholder="What investment thesis would you like to explore? (e.g., 'Generate a thesis for sustainable energy investments in emerging markets')"
              />
            </div>
            <button
              type="submit"
              onClick={handleGenerateThesis}
              disabled={loading || !query.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </button>
          </div>
        </div>

        {/* Thesis Display */}
        {thesis && (
          <div className="space-y-8">
            {/* Title and Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">{thesis.title}</h2>
                <div className="prose prose-lg max-w-none">
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed text-lg">{thesis.summary}</p>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">Executive Summary</h4>
                      <p className="text-gray-700 leading-relaxed">
                        The green energy sector represents a transformative investment opportunity driven by three key catalysts:
                      </p>
                      <ul className="mt-3 space-y-2">
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-500">•</span>
                          <span className="text-gray-700">Rapid technological advancement and cost reduction in renewable energy technologies</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-500">•</span>
                          <span className="text-gray-700">Strong policy support and regulatory frameworks accelerating the energy transition</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-500">•</span>
                          <span className="text-gray-700">Growing corporate and consumer demand for sustainable energy solutions</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Points */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Points</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {thesis.keyPoints.map((point, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-600 font-semibold">{index + 1}</span>
                      </div>
                      <p className="text-gray-700">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Market Context */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Market Context</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Current Trends
                    </h4>
                    <ul className="space-y-3">
                      {thesis.marketContext.currentTrends.map((trend, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-emerald-500">•</span>
                          <span className="text-gray-700">{trend}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Risks
                    </h4>
                    <ul className="space-y-3">
                      {thesis.marketContext.risks.map((risk, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span className="text-gray-700">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Opportunities
                    </h4>
                    <ul className="space-y-3">
                      {thesis.marketContext.opportunities.map((opportunity, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-500">•</span>
                          <span className="text-gray-700">{opportunity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Implications */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Portfolio Implications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Recommended Actions
                    </h4>
                    <ul className="space-y-3">
                      {thesis.portfolioImplications.recommendedActions.map((action, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-purple-500">•</span>
                          <span className="text-gray-700">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Timeline & Outcomes
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Timeline</p>
                        <p className="text-gray-700 mt-1">{thesis.portfolioImplications.timeline}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Expected Outcomes</p>
                        <ul className="mt-2 space-y-2">
                          {thesis.portfolioImplications.expectedOutcomes.map((outcome, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-yellow-500">•</span>
                              <span className="text-gray-700">{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Supporting Data */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Supporting Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Market Metrics
                    </h4>
                    <div className="space-y-4">
                      {Object.entries(thesis.supportingData.marketMetrics).map(([key, value]) => {
                        // Format the value based on the key
                        let formattedValue: string;
                        if (typeof value === 'number') {
                          const keyLower = key.toLowerCase();
                          
                          // Handle percentages and ratios
                          if (keyLower.includes('share') || 
                              keyLower.includes('percentage') || 
                              keyLower.includes('ratio') || 
                              keyLower.includes('return') ||
                              keyLower.includes('growth') ||
                              keyLower.includes('yield') ||
                              keyLower.includes('rate') ||
                              keyLower.includes('decline')) {
                            formattedValue = `${(value * 100).toFixed(1)}%`;
                          }
                          // Handle currency values
                          else if (keyLower.includes('investment') || 
                                  keyLower.includes('million') || 
                                  keyLower.includes('billion') || 
                                  keyLower.includes('trillion') ||
                                  keyLower.includes('dollars')) {
                            if (Math.abs(value) >= 1000000000000) {
                              formattedValue = `$${(value / 1000000000000).toFixed(1)}T`;
                            } else if (Math.abs(value) >= 1000000000) {
                              formattedValue = `$${(value / 1000000000).toFixed(1)}B`;
                            } else if (Math.abs(value) >= 1000000) {
                              formattedValue = `$${(value / 1000000).toFixed(1)}M`;
                            } else {
                              formattedValue = `$${value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}`;
                            }
                          }
                          // Handle currency values without unit specification
                          else if (keyLower.includes('value') || 
                                  keyLower.includes('price') || 
                                  keyLower.includes('revenue') || 
                                  keyLower.includes('income') || 
                                  keyLower.includes('earnings')) {
                            if (Math.abs(value) >= 1000000000000) {
                              formattedValue = `$${(value / 1000000000000).toFixed(1)}T`;
                            } else if (Math.abs(value) >= 1000000000) {
                              formattedValue = `$${(value / 1000000000).toFixed(1)}B`;
                            } else if (Math.abs(value) >= 1000000) {
                              formattedValue = `$${(value / 1000000).toFixed(1)}M`;
                            } else {
                              formattedValue = `$${value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}`;
                            }
                          }
                          // Handle index values
                          else if (keyLower.includes('index')) {
                            formattedValue = value.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            });
                          }
                          // Handle other numeric values
                          else {
                            formattedValue = value.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            });
                          }
                        } else {
                          formattedValue = value;
                        }

                        // Format the key to be more readable
                        const formattedKey = key
                          .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                          .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
                          .replace(/(\d{4})/g, ' $1 '); // Add spaces around years

                        // Determine if the value is positive or negative
                        const isPositive = typeof value === 'number' && value > 0;
                        const isNegative = typeof value === 'number' && value < 0;

                        // Determine if we should show trend indicators
                        const shouldShowTrend = key.toLowerCase().includes('growth') || 
                                              key.toLowerCase().includes('change') || 
                                              key.toLowerCase().includes('trend') ||
                                              key.toLowerCase().includes('momentum') ||
                                              key.toLowerCase().includes('decline');

                        return (
                          <div key={key} className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                            <div className="flex items-center space-x-3">
                              <div className="flex flex-col">
                                <span className="text-gray-700 font-medium">{formattedKey}</span>
                                {shouldShowTrend && (
                                  <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                                    isPositive ? 'bg-green-100 text-green-800' :
                                    isNegative ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {isPositive ? '↑ Increasing' : isNegative ? '↓ Decreasing' : '→ Stable'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`font-semibold text-lg ${
                              isPositive ? 'text-green-600' :
                              isNegative ? 'text-red-600' :
                              'text-gray-900'
                            }`}>
                              {formattedValue}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Relevant Indicators
                    </h4>
                    <div className="space-y-3">
                      {thesis.supportingData.relevantIndicators.map((indicator, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-100">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-orange-600 text-sm font-semibold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-gray-700">{indicator}</p>
                            {indicator.toLowerCase().includes('trend') && (
                              <div className="mt-1 flex items-center text-xs text-gray-500">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Last updated: {new Date().toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 