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

interface Claim {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  place_of_birth: string;
  regiment: string;
  military_category: string;
  nara_film_no: string;
  roll_no: string;
  beginning_frame: string;
  former_slave_owner: string;
  owner_residence: string;
}

const SlaveCompensationAdmin = () => {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Claim>>({});

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.push('/');
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchClaims();
    }
  }, [profile]);

  const fetchClaims = async () => {
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from('slave_compensation_claims')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setClaims(data || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
      alert('Failed to fetch claims');
    } finally {
      setLoadingData(false);
    }
  };

  const handleEdit = (claim: Claim) => {
    setEditingClaim(claim);
    setFormData(claim);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingClaim(null);
    setFormData({
      first_name: '',
      last_name: '',
      age: 0,
      place_of_birth: '',
      regiment: '',
      military_category: '',
      nara_film_no: '',
      roll_no: '',
      beginning_frame: '',
      former_slave_owner: '',
      owner_residence: ''
    });
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        const { error } = await supabase
          .from('slave_compensation_claims')
          .insert([formData]);

        if (error) throw error;
        alert('Claim created successfully');
      } else if (editingClaim) {
        const { error } = await supabase
          .from('slave_compensation_claims')
          .update(formData)
          .eq('id', editingClaim.id);

        if (error) throw error;
        alert('Claim updated successfully');
      }

      setEditingClaim(null);
      setIsCreating(false);
      setFormData({});
      fetchClaims();
    } catch (error) {
      console.error('Error saving claim:', error);
      alert('Failed to save claim');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this claim? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('slave_compensation_claims')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Claim deleted successfully');
      fetchClaims();
    } catch (error) {
      console.error('Error deleting claim:', error);
      alert('Failed to delete claim');
    }
  };

  const handleCancel = () => {
    setEditingClaim(null);
    setIsCreating(false);
    setFormData({});
  };

  const filteredClaims = claims.filter(
    (claim) =>
      `${claim.first_name} ${claim.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.place_of_birth?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.former_slave_owner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.owner_residence?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.regiment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-brown">Loading claims...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return null;
  }

  // Edit/Create Form
  if (editingClaim || isCreating) {
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
              {isCreating ? 'Create New Claim' : 'Edit Claim'}
            </h1>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <Input
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <Input
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <Input
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    placeholder="Age"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Place of Birth
                  </label>
                  <Input
                    value={formData.place_of_birth || ''}
                    onChange={(e) => setFormData({ ...formData, place_of_birth: e.target.value })}
                    placeholder="Place of Birth"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Regiment
                  </label>
                  <Input
                    value={formData.regiment || ''}
                    onChange={(e) => setFormData({ ...formData, regiment: e.target.value })}
                    placeholder="Regiment"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Military Category
                  </label>
                  <Input
                    value={formData.military_category || ''}
                    onChange={(e) => setFormData({ ...formData, military_category: e.target.value })}
                    placeholder="Military Category"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NARA Film No
                  </label>
                  <Input
                    value={formData.nara_film_no || ''}
                    onChange={(e) => setFormData({ ...formData, nara_film_no: e.target.value })}
                    placeholder="NARA Film No"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Roll No
                  </label>
                  <Input
                    value={formData.roll_no || ''}
                    onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                    placeholder="Roll No"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beginning Frame
                  </label>
                  <Input
                    value={formData.beginning_frame || ''}
                    onChange={(e) => setFormData({ ...formData, beginning_frame: e.target.value })}
                    placeholder="Beginning Frame"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Former Slave Owner
                  </label>
                  <Input
                    value={formData.former_slave_owner || ''}
                    onChange={(e) => setFormData({ ...formData, former_slave_owner: e.target.value })}
                    placeholder="Former Slave Owner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Residence
                  </label>
                  <Input
                    value={formData.owner_residence || ''}
                    onChange={(e) => setFormData({ ...formData, owner_residence: e.target.value })}
                    placeholder="Owner Residence"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  className="bg-brand-green hover:bg-brand-darkgreen flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isCreating ? 'Create Claim' : 'Save Changes'}
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
                Slave Compensation Claims
              </h1>
              <p className="text-gray-600 mt-2">
                Manage historical compensation claims records
              </p>
            </div>
            <Button
              onClick={handleCreate}
              className="bg-brand-green hover:bg-brand-darkgreen flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Claim
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
                placeholder="Search by name, location, owner, regiment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredClaims.length} of {claims.length} claims
          </div>

          {/* Claims Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Place of Birth</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Regiment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Former Owner</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-brand-brown">
                      {claim.first_name} {claim.last_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{claim.age}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{claim.place_of_birth}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{claim.regiment}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{claim.former_slave_owner}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(claim)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(claim.id)}
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

            {filteredClaims.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No claims found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlaveCompensationAdmin;
