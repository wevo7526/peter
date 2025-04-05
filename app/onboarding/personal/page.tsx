'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

interface PersonalInfo {
  age: number;
  income: number;
  employmentStatus: string;
  education: string;
  maritalStatus: string;
  dependents: number;
}

export default function PersonalInfoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PersonalInfo>({
    age: 0,
    income: 0,
    employmentStatus: '',
    education: '',
    maritalStatus: '',
    dependents: 0,
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
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...formData,
          updated_at: new Date().toISOString(),
        });

      if (dbError) {
        throw dbError;
      }

      router.push('/onboarding/financial-goals');
    } catch (error) {
      console.error('Error saving personal info:', error);
      setError('Failed to save personal information');
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
            <h1 className="text-2xl font-bold text-gray-900">Personal Information</h1>
            <p className="mt-2 text-sm text-gray-600">
              Help us understand your situation better to provide personalized insights.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                type="number"
                id="age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                required
                min="18"
              />
            </div>

            <div>
              <label htmlFor="income" className="block text-sm font-medium text-gray-700">
                Annual Income
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="income"
                  value={formData.income}
                  onChange={(e) => setFormData({ ...formData, income: parseInt(e.target.value) })}
                  className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  required
                  min="0"
                />
              </div>
            </div>

            <div>
              <label htmlFor="employmentStatus" className="block text-sm font-medium text-gray-700">
                Employment Status
              </label>
              <select
                id="employmentStatus"
                value={formData.employmentStatus}
                onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                required
              >
                <option value="">Select an option</option>
                <option value="employed">Employed</option>
                <option value="self-employed">Self-employed</option>
                <option value="retired">Retired</option>
                <option value="unemployed">Unemployed</option>
                <option value="student">Student</option>
              </select>
            </div>

            <div>
              <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                Education Level
              </label>
              <select
                id="education"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                required
              >
                <option value="">Select an option</option>
                <option value="high_school">High School</option>
                <option value="associate">Associate's Degree</option>
                <option value="bachelor">Bachelor's Degree</option>
                <option value="master">Master's Degree</option>
                <option value="doctorate">Doctorate</option>
              </select>
            </div>

            <div>
              <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700">
                Marital Status
              </label>
              <select
                id="maritalStatus"
                value={formData.maritalStatus}
                onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                required
              >
                <option value="">Select an option</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
                <option value="domestic_partnership">Domestic Partnership</option>
              </select>
            </div>

            <div>
              <label htmlFor="dependents" className="block text-sm font-medium text-gray-700">
                Number of Dependents
              </label>
              <input
                type="number"
                id="dependents"
                value={formData.dependents}
                onChange={(e) => setFormData({ ...formData, dependents: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                required
                min="0"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Next: Financial Goals'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 