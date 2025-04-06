'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { format } from 'date-fns';

interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'cancelled';
}

export default function PlanningPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [newGoal, setNewGoal] = useState<Partial<FinancialGoal>>({
    title: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: '',
    category: '',
    priority: 'medium',
    status: 'active',
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setLoading(false);
      fetchGoals(user.id);
    };

    checkUser();
  }, [router]);

  const fetchGoals = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setError('Failed to load financial goals');
    }
  };

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
        .from('financial_goals')
        .insert({
          ...newGoal,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (dbError) throw dbError;

      // Reset form and refresh goals
      setNewGoal({
        title: '',
        targetAmount: 0,
        currentAmount: 0,
        targetDate: '',
        category: '',
        priority: 'medium',
        status: 'active',
      });
      fetchGoals(user.id);
    } catch (error) {
      console.error('Error saving goal:', error);
      setError('Failed to save financial goal');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<FinancialGoal>) => {
    try {
      const { error } = await supabase
        .from('financial_goals')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goalId);

      if (error) throw error;

      // Refresh goals
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        fetchGoals(user.id);
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      setError('Failed to update financial goal');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      // Refresh goals
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        fetchGoals(user.id);
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      setError('Failed to delete financial goal');
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Financial Planning</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add New Goal Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Goal</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
                <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Goal Title
              </label>
              <input
                type="text"
                id="title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                required
              />
                </div>

                <div>
              <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">
                Target Amount
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="targetAmount"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: parseFloat(e.target.value) })}
                  className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700">
                Current Amount
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="currentAmount"
                  value={newGoal.currentAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, currentAmount: parseFloat(e.target.value) })}
                  className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700">
                Target Date
              </label>
                    <input
                      type="date"
                id="targetDate"
                value={newGoal.targetDate}
                onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                      required
                    />
                  </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
                    <select
                id="category"
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="retirement">Retirement</option>
                <option value="emergency">Emergency Fund</option>
                <option value="debt">Debt Repayment</option>
                <option value="investment">Investment</option>
                      <option value="education">Education</option>
                <option value="home">Home Purchase</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
                    <select
                id="priority"
                value={newGoal.priority}
                onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as 'high' | 'medium' | 'low' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                required
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add Goal'}
            </button>
          </form>
                  </div>

        {/* Goals List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Your Goals</h2>
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{goal.title}</h3>
                    <p className="text-sm text-gray-500">{goal.category}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateGoal(goal.id, { status: goal.status === 'active' ? 'completed' : 'active' })}
                      className="text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      {goal.status === 'active' ? 'Complete' : 'Reactivate'}
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress:</span>
                    <span>
                      ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Target Date: {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                  </div>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      goal.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : goal.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                  </span>
                  </div>
              </div>
            ))}
            {goals.length === 0 && (
              <p className="text-gray-500 text-center py-4">No financial goals yet. Add one to get started!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 