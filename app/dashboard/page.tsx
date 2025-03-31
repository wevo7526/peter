'use client';

import { useUser } from '@auth0/nextjs-auth0/client';

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Your AI-powered portfolio insights and strategy
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Portfolio Health Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Portfolio Health</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">Analyzing...</p>
          <p className="mt-1 text-sm text-emerald-600">AI-powered assessment</p>
        </div>

        {/* Strategy Score Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Strategy Score</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">-</p>
          <p className="mt-1 text-sm text-gray-500">AI strategy effectiveness</p>
        </div>

        {/* Market Opportunities Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Market Opportunities</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">-</p>
          <p className="mt-1 text-sm text-gray-500">AI-identified opportunities</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights Card */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">AI Portfolio Insights</h2>
            <p className="mt-2 text-sm text-gray-500">
              Your portfolio analysis and recommendations
            </p>
            <div className="mt-4 space-y-4">
              <div className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 text-emerald-500">🤖</span>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Portfolio Analysis</p>
                  <p className="text-sm text-gray-500">AI is analyzing your portfolio composition and risk profile</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 text-emerald-500">📊</span>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Performance Metrics</p>
                  <p className="text-sm text-gray-500">Evaluating portfolio performance and risk-adjusted returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Recommendations Card */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Strategy Recommendations</h2>
            <p className="mt-2 text-sm text-gray-500">
              AI-driven portfolio optimization suggestions
            </p>
            <div className="mt-4 space-y-4">
              <div className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 text-emerald-500">🎯</span>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Portfolio Optimization</p>
                  <p className="text-sm text-gray-500">AI is generating personalized optimization strategies</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 text-emerald-500">📈</span>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Market Opportunities</p>
                  <p className="text-sm text-gray-500">Identifying potential market opportunities and risks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 