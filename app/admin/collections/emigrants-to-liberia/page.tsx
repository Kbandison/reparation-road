"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  Save,
  X
} from 'lucide-react';

interface Emigrant {
  id: number;
  name: string;
  age?: number;
  state_of_origin?: string;
  free_status?: string;
  emancipated_by?: string;
  location_on_arrival?: string;
  education?: string;
  profession?: string;
  date_of_death?: string;
  cause_of_death?: string;
  removed_to?: string;
  removal_date?: string;
}

const EmigrantsToLiberiaAdmin = () => {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [emigrants, setEmigrants] = useState<Emigrant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [editingEmigrant, setEditingEmigrant] = useState<Emigrant | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Emigrant>>({});

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.push('/');
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchEmigrants();
    }
  }, [profile]);

  const fetchEmigrants = async () => {
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from('emmigrants_to_liberia')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setEmigrants(data || []);
    } catch (error) {
      console.error('Error fetching emigrants:', error);
      alert('Failed to fetch emigrants');
    } finally {
      setLoadingData(false);
    }
  };

  const handleEdit = (emigrant: Emigrant) => {
    setEditingEmigrant(emigrant);
    setFormData(emigrant);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingEmigrant(null);
    setFormData({
      name: '',
      age: undefined,
      state_of_origin: '',
      free_status: '',
      emancipated_by: '',
      location_on_arrival: '',
      education: '',
      profession: '',
      date_of_death: '',
      cause_of_death: '',
      removed_to: '',
      removal_date: ''
    });
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        const { error } = await supabase
          .from('emmigrants_to_liberia')
          .insert([formData]);

        if (error) throw error;
        alert('Emigrant created successfully');
      } else if (editingEmigrant) {
        const { error } = await supabase
          .from('emmigrants_to_liberia')
          .update(formData)
          .eq('id', editingEmigrant.id);

        if (error) throw error;
        alert('Emigrant updated successfully');
      }

      setEditingEmigrant(null);
      setIsCreating(false);
      setFormData({});
      fetchEmigrants();
    } catch (error) {
      console.error('Error saving emigrant:', error);
      alert('Failed to save emigrant');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('emmigrants_to_liberia')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Emigrant deleted successfully');
      fetchEmigrants();
    } catch (error) {
      console.error('Error deleting emigrant:', error);
      alert('Failed to delete emigrant');
    }
  };

  const handleCancel = () => {
    setEditingEmigrant(null);
    setIsCreating(false);
    setFormData({});
  };

  const filteredEmigrants = emigrants.filter(
    (emigrant) =>
      emigrant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emigrant.state_of_origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emigrant.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emigrant.location_on_arrival?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-brown">Loading emigrants...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return null;
  }

  // Edit/Create Form
  if (editingEmigrant || isCreating) {
    return (
      <div className="min-h-screen bg-brand-beige py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to List
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-brand-brown mb-6">
              {isCreating ? 'Create New Record' : 'Edit Record'}
            </h1>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <Input
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || undefined })}
                    placeholder="Age"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State of Origin
                  </label>
                  <Input
                    value={formData.state_of_origin || ''}
                    onChange={(e) => setFormData({ ...formData, state_of_origin: e.target.value })}
                    placeholder="State of Origin"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Free Status
                  </label>
                  <Input
                    value={formData.free_status || ''}
                    onChange={(e) => setFormData({ ...formData, free_status: e.target.value })}
                    placeholder="Free Status"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emancipated By
                  </label>
                  <Input
                    value={formData.emancipated_by || ''}
                    onChange={(e) => setFormData({ ...formData, emancipated_by: e.target.value })}
                    placeholder="Emancipated By"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location on Arrival
                  </label>
                  <Input
                    value={formData.location_on_arrival || ''}
                    onChange={(e) => setFormData({ ...formData, location_on_arrival: e.target.value })}
                    placeholder="Location on Arrival"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profession
                  </label>
                  <Input
                    value={formData.profession || ''}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    placeholder="Profession"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education
                </label>
                <Input
                  value={formData.education || ''}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  placeholder="Education"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Death
                  </label>
                  <Input
                    value={formData.date_of_death || ''}
                    onChange={(e) => setFormData({ ...formData, date_of_death: e.target.value })}
                    placeholder="Date of Death"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cause of Death
                  </label>
                  <Input
                    value={formData.cause_of_death || ''}
                    onChange={(e) => setFormData({ ...formData, cause_of_death: e.target.value })}
                    placeholder="Cause of Death"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Removed To
                  </label>
                  <Input
                    value={formData.removed_to || ''}
                    onChange={(e) => setFormData({ ...formData, removed_to: e.target.value })}
                    placeholder="Removed To"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Removal Date
                  </label>
                  <Input
                    value={formData.removal_date || ''}
                    onChange={(e) => setFormData({ ...formData, removal_date: e.target.value })}
                    placeholder="Removal Date"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  className="bg-brand-green hover:bg-brand-darkgreen flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isCreating ? 'Create Record' : 'Save Changes'}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="min-h-screen bg-brand-beige py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-6">
          <Button
            onClick={() => router.push('/admin/collections')}
            variant="outline"
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Collections
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-brand-brown">
                Emigrants to Liberia
              </h1>
              <p className="text-gray-600 mt-2">
                Manage ACS emigrant records
              </p>
            </div>
            <Button
              onClick={handleCreate}
              className="bg-brand-green hover:bg-brand-darkgreen flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Record
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search by name, origin, profession, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredEmigrants.length} of {emigrants.length} records
          </div>

          {/* Emigrants Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">State of Origin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Free Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profession</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmigrants.map((emigrant) => (
                  <tr key={emigrant.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-brand-brown">{emigrant.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emigrant.age || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emigrant.state_of_origin || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emigrant.free_status || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emigrant.profession || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(emigrant)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(emigrant.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredEmigrants.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No records found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmigrantsToLiberiaAdmin;
