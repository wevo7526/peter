'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Define interfaces
interface SavedQuery {
  id: string;
  query: string;
  timestamp: string;
}

interface ResearchResult {
  id: string;
  query: string;
  timestamp: string;
  insights: string[];
  dataSources: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export default function ResearchPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [recentResults, setRecentResults] = useState<ResearchResult[]>([]);
  const [currentResult, setCurrentResult] = useState<ResearchResult | null>(null);

  // Fetch saved queries and recent results on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/research');
        if (!response.ok) {
          throw new Error('Failed to fetch research data');
        }
        const data = await response.json();
        setSavedQueries(data.savedQueries);
        setRecentResults(data.recentResults);
      } catch (err) {
        console.error('Error fetching research data:', err);
        setError('Failed to load saved queries and recent results');
      }
    };

    fetchData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Analyze the query
      const analyzeResponse = await fetch('/api/research/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze query');
      }

      const { result } = await analyzeResponse.json();
      setCurrentResult(result);
      setRecentResults((prev) => [result, ...prev]);

      // Save the query
      const saveResponse = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save query');
      }

      const { query: savedQuery } = await saveResponse.json();
      setSavedQueries((prev) => [savedQuery, ...prev]);
      setQuery('');
    } catch (err) {
      console.error('Error in research submission:', err);
      setError('Failed to process your research query');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clicking on a saved query
  const handleSavedQueryClick = (savedQuery: SavedQuery) => {
    setQuery(savedQuery.query);
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get sentiment color
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Financial Research</h1>
      
      {/* Research Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
              Research Query
            </label>
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your research query (e.g., 'Analyze tech sector performance', 'Research Microsoft stock')"
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                isLoading || !query.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </form>
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md">
            {error}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Saved Queries */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Saved Queries</h2>
          {savedQueries.length === 0 ? (
            <p className="text-gray-500">No saved queries yet</p>
          ) : (
            <ul className="space-y-3">
              {savedQueries.map((savedQuery) => (
                <li key={savedQuery.id}>
                  <button
                    onClick={() => handleSavedQueryClick(savedQuery)}
                    className="w-full text-left p-3 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <p className="font-medium">{savedQuery.query}</p>
                    <p className="text-sm text-gray-500">{formatDate(savedQuery.timestamp)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Current Result */}
        {currentResult && (
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Research Result</h2>
            <div className="mb-4">
              <p className="font-medium">{currentResult.query}</p>
              <p className="text-sm text-gray-500">{formatDate(currentResult.timestamp)}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Insights</h3>
              <ul className="space-y-2">
                {currentResult.insights.map((insight, index) => (
                  <li key={index} className="p-3 bg-gray-50 rounded-md">
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Data Sources</h3>
              <div className="flex flex-wrap gap-2">
                {currentResult.dataSources.map((source, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Sentiment</h3>
              <span
                className={`px-3 py-1 rounded-full text-sm ${getSentimentColor(
                  currentResult.sentiment
                )}`}
              >
                {currentResult.sentiment.charAt(0).toUpperCase() + currentResult.sentiment.slice(1)}
              </span>
            </div>
          </div>
        )}
        
        {/* Recent Results */}
        {!currentResult && recentResults.length > 0 && (
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Results</h2>
            <div className="space-y-6">
              {recentResults.map((result) => (
                <div key={result.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="mb-4">
                    <p className="font-medium">{result.query}</p>
                    <p className="text-sm text-gray-500">{formatDate(result.timestamp)}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Insights</h3>
                    <ul className="space-y-2">
                      {result.insights.map((insight, index) => (
                        <li key={index} className="p-3 bg-gray-50 rounded-md">
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Data Sources</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.dataSources.map((source, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Sentiment</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getSentimentColor(
                        result.sentiment
                      )}`}
                    >
                      {result.sentiment.charAt(0).toUpperCase() + result.sentiment.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 