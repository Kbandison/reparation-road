"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Settings, Star, Calendar, BookOpen } from 'lucide-react';

const ProfilePage = () => {
  const router = useRouter();
  const { user, profile, updateProfile, loading, hasPremiumAccess } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const { error } = await updateProfile(formData);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
    }

    setSaving(false);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
      });
    }
    setEditing(false);
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-brown">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const getDisplayName = () => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile.first_name) {
      return profile.first_name;
    }
    return user.email?.split('@')[0] || 'User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-brand-beige py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6">
                {getInitials()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-brown mb-2">
                  {getDisplayName()}
                </h1>
                <p className="text-gray-600 mb-2">{user.email}</p>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    profile.subscription_status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <Star className="w-4 h-4 mr-1" />
                    {profile.subscription_status === 'paid' ? 'Premium' : 'Free'} Member
                  </span>
                  {profile.role === 'admin' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <Settings className="w-4 h-4 mr-1" />
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="font-semibold text-brand-brown">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-brand-brown flex items-center">
                <User className="w-6 h-6 mr-2" />
                Profile Information
              </h2>
              {!editing && (
                <Button
                  onClick={() => setEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  Edit
                </Button>
              )}
            </div>

            {message && (
              <div className={`p-3 rounded-md mb-4 ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-brown mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-brown mb-1">
                  First Name
                </label>
                <Input
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={!editing ? 'bg-gray-50' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-brown mb-1">
                  Last Name
                </label>
                <Input
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={!editing ? 'bg-gray-50' : ''}
                />
              </div>

              {editing && (
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={saving}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-brand-brown mb-6 flex items-center">
              <Settings className="w-6 h-6 mr-2" />
              Account Status
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-brand-tan rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-brand-brown">
                      {profile.role === 'admin' 
                        ? 'Administrator Access' 
                        : profile.subscription_status === 'paid' 
                        ? 'Premium Membership' 
                        : 'Free Membership'
                      }
                    </h3>
                    <p className="text-sm text-gray-600">
                      {profile.role === 'admin' 
                        ? 'Full administrative access and premium features'
                        : profile.subscription_status === 'paid' 
                        ? 'Access to all collections and features'
                        : 'Limited access to collections'
                      }
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    hasPremiumAccess ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
              </div>

              {profile.subscription_status === 'free' && profile.role !== 'admin' && (
                <div className="p-4 border border-brand-green rounded-lg">
                  <h3 className="font-semibold text-brand-brown mb-2">
                    Upgrade to Premium
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Get full access to all historical collections, advanced search, 
                    and download capabilities.
                  </p>
                  <Button
                    onClick={() => router.push('/membership')}
                    className="w-full bg-brand-green hover:bg-brand-darkgreen"
                  >
                    Upgrade Now
                  </Button>
                </div>
              )}

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-brand-brown mb-2 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Recent Activity
                </h3>
                <p className="text-sm text-gray-600">
                  Your recent searches and bookmarks will appear here once you start 
                  exploring our collections.
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-brand-brown mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button
                    onClick={() => router.push('/collection')}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    Browse Collections
                  </Button>
                  <Button
                    onClick={() => router.push('/booking')}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    Book Consultation
                  </Button>
                  {profile.role === 'admin' && (
                    <Button
                      onClick={() => router.push('/admin')}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      Admin Dashboard
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;