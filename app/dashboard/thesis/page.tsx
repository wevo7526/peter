'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface MarketContext {
  currentTrends: string[];
  risks: string[];
  opportunities: string[];
}

interface PortfolioImplications {
  recommendedActions: string[];
  timeline: string;
  expectedOutcomes: string[];
}

interface SupportingData {
  marketMetrics: Record<string, number>;
  relevantIndicators: string[];
}

interface InvestmentThesis {
  title: string;
  summary: string;
  keyPoints: string[];
  marketContext: MarketContext;
  portfolioImplications: PortfolioImplications;
  supportingData: SupportingData;
}

export default function ThesisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thesis, setThesis] = useState<InvestmentThesis | null>(null);
  const [query, setQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    keyPoints: true,
    marketContext: true,
    portfolioImplications: true,
    supportingData: true,
  });
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        router.push('/auth/signin');
        return;
      }

      const response = await fetch('/api/thesis/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          query,
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate thesis');
      }

      const data = await response.json();
      console.log('Received data:', data); // Debug log

      // Check if the data is already in the correct format
      if (data.title && data.summary && data.keyPoints) {
        setThesis(data);
        return;
      }

      // If data is in the output field, try to parse it
      if (data.output) {
        try {
          // First try to parse the output directly
          const parsedOutput = JSON.parse(data.output);
          if (parsedOutput.title && parsedOutput.summary && parsedOutput.keyPoints) {
            setThesis(parsedOutput);
            return;
          }
        } catch (parseError) {
          console.log('Direct parse failed, trying regex extraction');
        }

        // If direct parse failed, try regex extraction
        const jsonMatch = data.output.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const thesisData = JSON.parse(jsonMatch[0]);
            if (thesisData.title && thesisData.summary && thesisData.keyPoints) {
              setThesis(thesisData);
              return;
            }
          } catch (parseError) {
            console.error('Failed to parse extracted JSON:', parseError);
          }
        }
      }

      // If we get here, we couldn't find valid thesis data
      console.error('Invalid thesis data structure:', data);
      throw new Error('Invalid thesis data format');
    } catch (error) {
      console.error('Thesis generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate thesis');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8"
      >
        Investment Thesis Generator
      </motion.h1>

      <motion.form 
        onSubmit={handleSubmit} 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="mb-4">
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
            What would you like to analyze?
          </label>
          <textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            rows={4}
            placeholder="e.g., Analyze the potential of investing in renewable energy companies in the next 5 years"
            required
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Thesis'
          )}
        </motion.button>
      </motion.form>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-red-100 text-red-800 rounded-md"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {thesis && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">{thesis.title}</h2>
              <motion.button
                onClick={() => copyToClipboard(JSON.stringify(thesis, null, 2))}
                className="p-2 text-gray-500 hover:text-emerald-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {copiedText ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </motion.button>
            </div>
            
            <div className="prose max-w-none">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-700 mb-6"
              >
                {thesis.summary}
              </motion.p>

              <div className="space-y-6">
                {/* Key Points Section */}
                <motion.div 
                  className="border rounded-lg overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <button
                    onClick={() => toggleSection('keyPoints')}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">Key Points</h3>
                    {expandedSections.keyPoints ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  <AnimatePresence>
                    {expandedSections.keyPoints && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 py-3"
                      >
                        <ul className="list-disc pl-5 space-y-2">
                          {thesis.keyPoints.map((point, index) => (
                            <motion.li 
                              key={index} 
                              className="text-gray-700"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              {point}
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Market Context Section */}
                <motion.div 
                  className="border rounded-lg overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <button
                    onClick={() => toggleSection('marketContext')}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">Market Context</h3>
                    {expandedSections.marketContext ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  <AnimatePresence>
                    {expandedSections.marketContext && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 py-3 space-y-4"
                      >
                        {Object.entries(thesis.marketContext).map(([key, value]) => (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <h4 className="font-medium text-gray-900 mb-2 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <ul className="list-disc pl-5 space-y-2">
                              {value.map((item: string, index: number) => (
                                <motion.li 
                                  key={index} 
                                  className="text-gray-700"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  {item}
                                </motion.li>
                              ))}
                            </ul>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Portfolio Implications Section */}
                <motion.div 
                  className="border rounded-lg overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <button
                    onClick={() => toggleSection('portfolioImplications')}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">Portfolio Implications</h3>
                    {expandedSections.portfolioImplications ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  <AnimatePresence>
                    {expandedSections.portfolioImplications && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 py-3 space-y-4"
                      >
                        {Object.entries(thesis.portfolioImplications).map(([key, value]) => (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <h4 className="font-medium text-gray-900 mb-2 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            {Array.isArray(value) ? (
                              <ul className="list-disc pl-5 space-y-2">
                                {value.map((item: string, index: number) => (
                                  <motion.li 
                                    key={index} 
                                    className="text-gray-700"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                  >
                                    {item}
                                  </motion.li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-700">{value}</p>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Supporting Data Section */}
                <motion.div 
                  className="border rounded-lg overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <button
                    onClick={() => toggleSection('supportingData')}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">Supporting Data</h3>
                    {expandedSections.supportingData ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  <AnimatePresence>
                    {expandedSections.supportingData && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 py-3 space-y-4"
                      >
                        {Object.entries(thesis.supportingData).map(([key, value]) => (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <h4 className="font-medium text-gray-900 mb-2 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            {typeof value === 'object' ? (
                              <ul className="list-disc pl-5 space-y-2">
                                {Object.entries(value as Record<string, any>).map(([subKey, subValue]) => (
                                  <motion.li 
                                    key={subKey} 
                                    className="text-gray-700"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                  >
                                    {subKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {subValue}
                                  </motion.li>
                                ))}
                              </ul>
                            ) : (
                              <ul className="list-disc pl-5 space-y-2">
                                {(value as string[]).map((item, index) => (
                                  <motion.li 
                                    key={index} 
                                    className="text-gray-700"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                  >
                                    {item}
                                  </motion.li>
                                ))}
                              </ul>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 