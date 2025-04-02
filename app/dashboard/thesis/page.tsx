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
    marketMetrics: Record<string, number>;
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Investment Thesis Generator
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Generate comprehensive investment theses based on your portfolio and market conditions
        </p>
      </div>

      {/* Query Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
              rows={2}
              placeholder="Ask for an investment thesis (e.g., 'Generate a thesis for sustainable energy investments')"
            />
          </div>
          <button
            type="submit"
            onClick={handleGenerateThesis}
            disabled={loading || !query.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
              'Generate Thesis'
            )}
          </button>
        </div>
      </div>

      {/* Thesis Display */}
      {thesis && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{thesis.title}</h2>
            
            {/* Summary */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
              <p className="text-gray-700">{thesis.summary}</p>
            </div>

            {/* Key Points */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Points</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {thesis.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>

            {/* Market Context */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Context</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Current Trends</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {thesis.marketContext.currentTrends.map((trend, index) => (
                      <li key={index}>{trend}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Risks</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {thesis.marketContext.risks.map((risk, index) => (
                      <li key={index}>{risk}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Opportunities</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {thesis.marketContext.opportunities.map((opportunity, index) => (
                      <li key={index}>{opportunity}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Portfolio Implications */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Implications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Recommended Actions</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {thesis.portfolioImplications.recommendedActions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                  <p className="text-sm text-gray-700">{thesis.portfolioImplications.timeline}</p>
                  <h4 className="font-medium text-gray-900 mt-4 mb-2">Expected Outcomes</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {thesis.portfolioImplications.expectedOutcomes.map((outcome, index) => (
                      <li key={index}>{outcome}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Supporting Data */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Supporting Data</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Market Metrics</h4>
                  <div className="space-y-2">
                    {Object.entries(thesis.supportingData.marketMetrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-700">{key}</span>
                        <span className="font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Relevant Indicators</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {thesis.supportingData.relevantIndicators.map((indicator, index) => (
                      <li key={index}>{indicator}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
} 