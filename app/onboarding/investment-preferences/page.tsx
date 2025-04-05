'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

interface InvestmentPreferences {
  preferredAssetClasses: string[];
  investmentStyle: string;
  rebalancingFrequency: string;
  taxConsiderations: string[];
  ethicalPreferences: string[];
}

export default function InvestmentPreferencesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<InvestmentPreferences>({
    preferredAssetClasses: [],
    investmentStyle: '',
    rebalancingFrequency: '',
    taxConsiderations: [],
    ethicalPreferences: [],
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
        .from('user_investment_preferences')
        .upsert({
          user_id: user.id,
          ...formData,
          updated_at: new Date().toISOString(),
        });

      if (dbError) {
        throw dbError;
      }

      // Mark onboarding as complete
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (profileError) {
        throw profileError;
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving investment preferences:', error);
      setError('Failed to save investment preferences');
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
            <h1 className="text-2xl font-bold text-gray-900">Investment Preferences</h1>
            <p className="mt-2 text-sm text-gray-600">
              Tell us about your investment preferences to help us create a personalized portfolio strategy.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Asset Classes (Select all that apply)
              </label>
              <div className="space-y-2">
                {['stocks', 'bonds', 'real_estate', 'cryptocurrency', 'commodities', 'cash'].map((asset) => (
                  <div key={asset} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`asset-${asset}`}
                      checked={formData.preferredAssetClasses.includes(asset)}
                      onChange={(e) => {
                        const newAssets = e.target.checked
                          ? [...formData.preferredAssetClasses, asset]
                          : formData.preferredAssetClasses.filter(a => a !== asset);
                        setFormData({ ...formData, preferredAssetClasses: newAssets });
                      }}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`asset-${asset}`} className="ml-2 block text-sm text-gray-900">
                      {asset.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="investmentStyle" className="block text-sm font-medium text-gray-700">
                Investment Style
              </label>
              <select
                id="investmentStyle"
                value={formData.investmentStyle}
                onChange={(e) => setFormData({ ...formData, investmentStyle: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                required
              >
                <option value="">Select your investment style</option>
                <option value="passive">Passive (Index Funds)</option>
                <option value="active">Active (Stock Picking)</option>
                <option value="balanced">Balanced (Mix of Both)</option>
              </select>
            </div>

            <div>
              <label htmlFor="rebalancingFrequency" className="block text-sm font-medium text-gray-700">
                Preferred Rebalancing Frequency
              </label>
              <select
                id="rebalancingFrequency"
                value={formData.rebalancingFrequency}
                onChange={(e) => setFormData({ ...formData, rebalancingFrequency: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                required
              >
                <option value="">Select frequency</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
                <option value="threshold">When Threshold Reached</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Considerations (Select all that apply)
              </label>
              <div className="space-y-2">
                {['tax_deferred', 'tax_free', 'taxable', 'estate_planning'].map((consideration) => (
                  <div key={consideration} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`tax-${consideration}`}
                      checked={formData.taxConsiderations.includes(consideration)}
                      onChange={(e) => {
                        const newConsiderations = e.target.checked
                          ? [...formData.taxConsiderations, consideration]
                          : formData.taxConsiderations.filter(c => c !== consideration);
                        setFormData({ ...formData, taxConsiderations: newConsiderations });
                      }}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`tax-${consideration}`} className="ml-2 block text-sm text-gray-900">
                      {consideration.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ethical Investment Preferences (Select all that apply)
              </label>
              <div className="space-y-2">
                {['esg', 'sri', 'impact_investing', 'fossil_free'].map((preference) => (
                  <div key={preference} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`ethical-${preference}`}
                      checked={formData.ethicalPreferences.includes(preference)}
                      onChange={(e) => {
                        const newPreferences = e.target.checked
                          ? [...formData.ethicalPreferences, preference]
                          : formData.ethicalPreferences.filter(p => p !== preference);
                        setFormData({ ...formData, ethicalPreferences: newPreferences });
                      }}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`ethical-${preference}`} className="ml-2 block text-sm text-gray-900">
                      {preference.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
                {saving ? 'Saving...' : 'Complete Onboarding'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 