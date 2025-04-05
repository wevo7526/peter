'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

interface FinancialGoals {
  primaryGoal: string;
  secondaryGoals: string[];
  timeHorizon: string;
  riskTolerance: number;
  monthlyInvestment: number;
  targetRetirementAge: number;
  currentSavings: number;
  debtAmount: number;
  debtTypes: string[];
}

export default function FinancialGoalsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FinancialGoals>({
    primaryGoal: '',
    secondaryGoals: [],
    timeHorizon: '',
    riskTolerance: 5,
    monthlyInvestment: 0,
    targetRetirementAge: 65,
    currentSavings: 0,
    debtAmount: 0,
    debtTypes: [],
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const { error: dbError } = await supabase
        .from('user_financial_goals')
        .upsert({
          user_id: user.id,
          ...formData,
          updated_at: new Date().toISOString(),
        });

      if (dbError) {
        throw dbError;
      }

      router.push('/onboarding/investment-preferences');
    } catch (error) {
      console.error('Error saving financial goals:', error);
      setError('Failed to save financial goals');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Financial Goals</h1>
            <p className="mt-2 text-sm text-gray-600">
              Tell us about your financial objectives and preferences to help us provide relevant insights.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="primaryGoal" className="block text-sm font-medium text-gray-700">
                Primary Financial Goal
              </label>
              <select
                id="primaryGoal"
                value={formData.primaryGoal}
                onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                required
              >
                <option value="">Select your primary goal</option>
                <option value="retirement">Retirement Planning</option>
                <option value="wealth_building">Wealth Building</option>
                <option value="debt_management">Debt Management</option>
                <option value="education">Education Funding</option>
                <option value="home_ownership">Home Ownership</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Goals (Select all that apply)
              </label>
              <div className="space-y-2">
                {['retirement', 'wealth_building', 'debt_management', 'education', 'home_ownership'].map((goal) => (
                  <div key={goal} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`secondary-${goal}`}
                      checked={formData.secondaryGoals.includes(goal)}
                      onChange={(e) => {
                        const newGoals = e.target.checked
                          ? [...formData.secondaryGoals, goal]
                          : formData.secondaryGoals.filter(g => g !== goal);
                        setFormData({ ...formData, secondaryGoals: newGoals });
                      }}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`secondary-${goal}`} className="ml-2 block text-sm text-gray-900">
                      {goal.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="timeHorizon" className="block text-sm font-medium text-gray-700">
                Investment Time Horizon
              </label>
              <select
                id="timeHorizon"
                value={formData.timeHorizon}
                onChange={(e) => setFormData({ ...formData, timeHorizon: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                required
              >
                <option value="">Select time horizon</option>
                <option value="short_term">Short Term (1-3 years)</option>
                <option value="medium_term">Medium Term (3-7 years)</option>
                <option value="long_term">Long Term (7+ years)</option>
              </select>
            </div>

            <div>
              <label htmlFor="riskTolerance" className="block text-sm font-medium text-gray-700">
                Risk Tolerance (1-10)
              </label>
              <input
                type="range"
                id="riskTolerance"
                min="1"
                max="10"
                value={formData.riskTolerance}
                onChange={(e) => setFormData({ ...formData, riskTolerance: parseInt(e.target.value) })}
                className="mt-1 block w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Conservative</span>
                <span>Moderate</span>
                <span>Aggressive</span>
              </div>
            </div>

            <div>
              <label htmlFor="monthlyInvestment" className="block text-sm font-medium text-gray-700">
                Monthly Investment Amount
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="monthlyInvestment"
                  value={formData.monthlyInvestment}
                  onChange={(e) => setFormData({ ...formData, monthlyInvestment: parseInt(e.target.value) })}
                  className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  required
                  min="0"
                />
              </div>
            </div>

            <div>
              <label htmlFor="targetRetirementAge" className="block text-sm font-medium text-gray-700">
                Target Retirement Age
              </label>
              <input
                type="number"
                id="targetRetirementAge"
                value={formData.targetRetirementAge}
                onChange={(e) => setFormData({ ...formData, targetRetirementAge: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                required
                min="50"
                max="80"
              />
            </div>

            <div>
              <label htmlFor="currentSavings" className="block text-sm font-medium text-gray-700">
                Current Savings
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="currentSavings"
                  value={formData.currentSavings}
                  onChange={(e) => setFormData({ ...formData, currentSavings: parseInt(e.target.value) })}
                  className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  required
                  min="0"
                />
              </div>
            </div>

            <div>
              <label htmlFor="debtAmount" className="block text-sm font-medium text-gray-700">
                Total Debt Amount
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="debtAmount"
                  value={formData.debtAmount}
                  onChange={(e) => setFormData({ ...formData, debtAmount: parseInt(e.target.value) })}
                  className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  required
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Types of Debt (Select all that apply)
              </label>
              <div className="space-y-2">
                {['mortgage', 'student_loans', 'credit_cards', 'car_loans', 'personal_loans'].map((debt) => (
                  <div key={debt} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`debt-${debt}`}
                      checked={formData.debtTypes.includes(debt)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...formData.debtTypes, debt]
                          : formData.debtTypes.filter(t => t !== debt);
                        setFormData({ ...formData, debtTypes: newTypes });
                      }}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`debt-${debt}`} className="ml-2 block text-sm text-gray-900">
                      {debt.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Next: Investment Preferences'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 