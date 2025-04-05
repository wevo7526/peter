'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

interface InvestmentThesis {
  title: string;
  summary: string;
  keyPoints: string[];
  risks: string[];
  recommendations: string[];
  createdAt: string;
}

export default function ThesisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thesis, setThesis] = useState<InvestmentThesis | null>(null);
  const [query, setQuery] = useState('');

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

      const response = await fetch('/api/thesis/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate thesis');
      }

      const data = await response.json();
      setThesis(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate thesis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Investment Thesis Generator</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
            What would you like to analyze?
          </label>
          <textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            rows={4}
            placeholder="e.g., Analyze the potential of investing in renewable energy companies in the next 5 years"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate Thesis'}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}

      {thesis && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{thesis.title}</h2>
          
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-6">{thesis.summary}</p>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Points</h3>
              <ul className="list-disc pl-5 space-y-2">
                {thesis.keyPoints.map((point, index) => (
                  <li key={index} className="text-gray-700">{point}</li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Risks</h3>
              <ul className="list-disc pl-5 space-y-2">
                {thesis.risks.map((risk, index) => (
                  <li key={index} className="text-gray-700">{risk}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Recommendations</h3>
              <ul className="list-disc pl-5 space-y-2">
                {thesis.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-gray-700">{recommendation}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            Generated on {new Date(thesis.createdAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
} 