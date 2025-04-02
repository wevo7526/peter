'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { format } from 'date-fns';

interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'retirement' | 'education' | 'home' | 'travel' | 'emergency' | 'other';
  priority: 'high' | 'medium' | 'low';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category: 'housing' | 'transportation' | 'food' | 'utilities' | 'insurance' | 'healthcare' | 'savings' | 'entertainment' | 'other';
  period: 'monthly' | 'quarterly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

interface InvestmentStrategy {
  id: string;
  name: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  timeHorizon: 'short' | 'medium' | 'long';
  allocation: {
    stocks: number;
    bonds: number;
    cash: number;
    realEstate: number;
    crypto: number;
    other: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface FinancialPlan {
  id: string;
  userId: string;
  goals: FinancialGoal[];
  budgets: Budget[];
  strategies: InvestmentStrategy[];
  createdAt: string;
  updatedAt: string;
}

export default function PlanningPage() {
  const { user, isLoading: userLoading } = useUser();
  const [plan, setPlan] = useState<FinancialPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'goals' | 'budgets' | 'strategies'>('goals');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'goal' | 'budget' | 'strategy'>('goal');
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (!userLoading && user) {
      fetchPlan();
    }
  }, [user, userLoading]);

  const fetchPlan = async () => {
    try {
      const response = await fetch('/api/planning');
      if (!response.ok) {
        throw new Error('Failed to fetch financial plan');
      }
      const data = await response.json();
      setPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/planning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: `add_${modalType}`,
          data: formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      const data = await response.json();
      setPlan(data.plan);
      setShowAddModal(false);
      setFormData({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      const response = await fetch('/api/planning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: `update_${modalType}`,
          data: { id, ...data },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      const responseData = await response.json();
      setPlan(responseData.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/planning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: `delete_${modalType}`,
          data: { id },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      const data = await response.json();
      setPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financial Planning</h1>
        <button
          onClick={() => {
            setModalType(activeTab.slice(0, -1) as 'goal' | 'budget' | 'strategy');
            setShowAddModal(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New {activeTab.slice(0, -1)}
        </button>
      </div>

      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(['goals', 'budgets', 'strategies'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'goals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plan?.goals.map((goal) => (
            <div key={goal.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                  {goal.priority}
                </span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(
                      (goal.currentAmount / goal.targetAmount) * 100
                    )}`}
                    style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Target Amount</p>
                  <p className="text-lg font-semibold">${goal.targetAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Amount</p>
                  <p className="text-lg font-semibold">${goal.currentAmount.toLocaleString()}</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">Target Date</p>
                <p className="text-lg font-semibold">{format(new Date(goal.targetDate), 'MMM d, yyyy')}</p>
              </div>
              {goal.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Notes</p>
                  <p className="text-sm">{goal.notes}</p>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setModalType('goal');
                    setFormData(goal);
                    setShowAddModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'budgets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plan?.budgets.map((budget) => (
            <div key={budget.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {budget.period}
                </span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Spent</span>
                  <span>{Math.round((budget.spent / budget.amount) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor((budget.spent / budget.amount) * 100)}`}
                    style={{ width: `${Math.min((budget.spent / budget.amount) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Budget Amount</p>
                  <p className="text-lg font-semibold">${budget.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Spent</p>
                  <p className="text-lg font-semibold">${budget.spent.toLocaleString()}</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">Category</p>
                <p className="text-lg font-semibold capitalize">{budget.category}</p>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleDelete(budget.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setModalType('budget');
                    setFormData(budget);
                    setShowAddModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'strategies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plan?.strategies.map((strategy) => (
            <div key={strategy.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{strategy.name}</h3>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {strategy.riskTolerance}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {strategy.timeHorizon}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Asset Allocation</h4>
                <div className="space-y-2">
                  {Object.entries(strategy.allocation).map(([asset, percentage]) => (
                    <div key={asset} className="flex items-center">
                      <div className="w-24 text-sm text-gray-600 capitalize">{asset}</div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-12 text-right text-sm text-gray-600">{percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleDelete(strategy.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setModalType('strategy');
                    setFormData(strategy);
                    setShowAddModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {formData.id ? 'Edit' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
            </h2>
            <form onSubmit={handleAdd}>
              {modalType === 'goal' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                    <input
                      type="number"
                      value={formData.targetAmount || ''}
                      onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Amount</label>
                    <input
                      type="number"
                      value={formData.currentAmount || ''}
                      onChange={(e) => setFormData({ ...formData, currentAmount: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                    <input
                      type="date"
                      value={formData.targetDate ? formData.targetDate.split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, targetDate: new Date(e.target.value).toISOString() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="retirement">Retirement</option>
                      <option value="education">Education</option>
                      <option value="home">Home</option>
                      <option value="travel">Travel</option>
                      <option value="emergency">Emergency</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority || 'medium'}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {modalType === 'budget' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Spent</label>
                    <input
                      type="number"
                      value={formData.spent || ''}
                      onChange={(e) => setFormData({ ...formData, spent: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="housing">Housing</option>
                      <option value="transportation">Transportation</option>
                      <option value="food">Food</option>
                      <option value="utilities">Utilities</option>
                      <option value="insurance">Insurance</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="savings">Savings</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                    <select
                      value={formData.period || 'monthly'}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </>
              )}

              {modalType === 'strategy' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Risk Tolerance</label>
                    <select
                      value={formData.riskTolerance || 'moderate'}
                      onChange={(e) => setFormData({ ...formData, riskTolerance: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="conservative">Conservative</option>
                      <option value="moderate">Moderate</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Horizon</label>
                    <select
                      value={formData.timeHorizon || 'medium'}
                      onChange={(e) => setFormData({ ...formData, timeHorizon: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asset Allocation</label>
                    {['stocks', 'bonds', 'cash', 'realEstate', 'crypto', 'other'].map((asset) => (
                      <div key={asset} className="flex items-center mb-2">
                        <label className="w-24 text-sm text-gray-600 capitalize">{asset}</label>
                        <input
                          type="number"
                          value={formData.allocation?.[asset] || 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              allocation: {
                                ...formData.allocation,
                                [asset]: parseFloat(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          min="0"
                          max="100"
                          required
                        />
                        <span className="ml-2">%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({});
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md"
                >
                  {formData.id ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 