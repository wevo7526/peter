'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  company: string;
  role: string;
  location: string;
  website: string;
  avatar_url: string;
  bio: string;
  investment_focus: string[];
  investment_experience: 'beginner' | 'intermediate' | 'advanced';
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  investment_horizon: number;
  monthly_investment_capacity: number;
  total_investable_assets: number;
  investment_goals: string[];
  preferred_investment_styles: string[];
  sector_preferences: string[];
  ethical_investment_preferences: string[];
  tax_situation: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setUser(user);
      await fetchProfile(user.id);
    };

    getUser();
  }, [router]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: user?.email,
              investment_experience: 'beginner',
              risk_tolerance: 'moderate',
              investment_horizon: 10,
              monthly_investment_capacity: 0,
              total_investable_assets: 0,
              investment_goals: [],
              preferred_investment_styles: [],
              sector_preferences: [],
              ethical_investment_preferences: [],
              tax_situation: 'standard',
            })
            .select()
            .single();

          if (createError) throw createError;
          setProfile(newProfile);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
        if (data.avatar_url) {
          setAvatarPreview(data.avatar_url);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile?.full_name,
          email: user.email,
          company: profile?.company,
          role: profile?.role,
          location: profile?.location,
          website: profile?.website,
          avatar_url: avatarUrl,
          bio: profile?.bio,
          investment_focus: profile?.investment_focus || [],
          investment_experience: profile?.investment_experience || 'beginner',
          risk_tolerance: profile?.risk_tolerance || 'moderate',
          investment_horizon: profile?.investment_horizon || 10,
          monthly_investment_capacity: profile?.monthly_investment_capacity || 0,
          total_investable_assets: profile?.total_investable_assets || 0,
          investment_goals: profile?.investment_goals || [],
          preferred_investment_styles: profile?.preferred_investment_styles || [],
          sector_preferences: profile?.sector_preferences || [],
          ethical_investment_preferences: profile?.ethical_investment_preferences || [],
          tax_situation: profile?.tax_situation || 'standard',
        });

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl text-emerald-700 font-medium">
                        {user?.email?.[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <label
                    htmlFor="avatar"
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 border-2 border-emerald-500 cursor-pointer hover:bg-emerald-50"
                  >
                    <svg
                      className="w-4 h-4 text-emerald-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </label>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile?.full_name || ''}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev!, full_name: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profile?.company || ''}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev!, company: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={profile?.role || ''}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev!, role: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile?.location || ''}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev!, location: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profile?.website || ''}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev!, website: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Investment Profile</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="investment_experience">Investment Experience</Label>
                  <select
                    id="investment_experience"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={profile?.investment_experience || 'beginner'}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev!,
                        investment_experience: e.target.value as 'beginner' | 'intermediate' | 'advanced',
                      }))
                    }
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="risk_tolerance">Risk Tolerance</Label>
                  <select
                    id="risk_tolerance"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={profile?.risk_tolerance || 'moderate'}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev!,
                        risk_tolerance: e.target.value as 'conservative' | 'moderate' | 'aggressive',
                      }))
                    }
                  >
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="investment_horizon">Investment Horizon (years)</Label>
                  <Input
                    id="investment_horizon"
                    type="number"
                    min="1"
                    value={profile?.investment_horizon || 10}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev!,
                        investment_horizon: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="monthly_investment_capacity">Monthly Investment Capacity</Label>
                  <Input
                    id="monthly_investment_capacity"
                    type="number"
                    min="0"
                    step="100"
                    value={profile?.monthly_investment_capacity || 0}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev!,
                        monthly_investment_capacity: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="total_investable_assets">Total Investable Assets</Label>
                <Input
                  id="total_investable_assets"
                  type="number"
                  min="0"
                  step="1000"
                  value={profile?.total_investable_assets || 0}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev!,
                      total_investable_assets: parseInt(e.target.value),
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="investment_goals">Investment Goals</Label>
                <Input
                  id="investment_goals"
                  value={profile?.investment_goals?.join(', ') || ''}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev!,
                      investment_goals: e.target.value.split(',').map((s) => s.trim()),
                    }))
                  }
                  placeholder="e.g., Retirement, Home Purchase, Wealth Growth"
                />
              </div>

              <div>
                <Label htmlFor="preferred_investment_styles">Preferred Investment Styles</Label>
                <Input
                  id="preferred_investment_styles"
                  value={profile?.preferred_investment_styles?.join(', ') || ''}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev!,
                      preferred_investment_styles: e.target.value.split(',').map((s) => s.trim()),
                    }))
                  }
                  placeholder="e.g., Value Investing, Growth Investing, Dividend Investing"
                />
              </div>

              <div>
                <Label htmlFor="sector_preferences">Sector Preferences</Label>
                <Input
                  id="sector_preferences"
                  value={profile?.sector_preferences?.join(', ') || ''}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev!,
                      sector_preferences: e.target.value.split(',').map((s) => s.trim()),
                    }))
                  }
                  placeholder="e.g., Technology, Healthcare, Renewable Energy"
                />
              </div>

              <div>
                <Label htmlFor="ethical_investment_preferences">Ethical Investment Preferences</Label>
                <Input
                  id="ethical_investment_preferences"
                  value={profile?.ethical_investment_preferences?.join(', ') || ''}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev!,
                      ethical_investment_preferences: e.target.value.split(',').map((s) => s.trim()),
                    }))
                  }
                  placeholder="e.g., ESG, Clean Energy, Social Impact"
                />
              </div>

              <div>
                <Label htmlFor="tax_situation">Tax Situation</Label>
                <select
                  id="tax_situation"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={profile?.tax_situation || 'standard'}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev!,
                      tax_situation: e.target.value,
                    }))
                  }
                >
                  <option value="standard">Standard</option>
                  <option value="high_income">High Income</option>
                  <option value="retirement">Retirement</option>
                  <option value="tax_exempt">Tax Exempt</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 