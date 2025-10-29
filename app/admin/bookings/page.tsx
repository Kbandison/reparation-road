"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  Clock,
  User,
  Mail,
  MessageSquare,
  Search,
  Filter,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

interface Booking {
  id: string;
  name: string;
  email: string;
  message: string;
  session_type: string;
  date: string;
  time: string;
  created_at: string;
}

const AdminBookingsPage = () => {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionFilter, setSessionFilter] = useState<'all' | 'genealogy' | 'standard'>('all');
  const [timeFilter, setTimeFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Protect route - redirect if not admin
  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.push('/');
    }
  }, [user, profile, loading, router]);

  // Fetch bookings
  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchBookings();
    }
  }, [profile]);

  // Filter bookings based on search and filters
  useEffect(() => {
    let filtered = bookings;

    // Apply time filter (past vs upcoming)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

    if (timeFilter === 'upcoming') {
      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= today;
      });
    } else if (timeFilter === 'past') {
      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.date);
        return bookingDate < today;
      });
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply session type filter
    if (sessionFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.session_type === sessionFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, sessionFilter, timeFilter]);

  const fetchBookings = async () => {
    try {
      setDataLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
      setFilteredBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      const { error } = await supabase.from('bookings').delete().eq('id', id);

      if (error) throw error;
      await fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-brown">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return null;
  }

  const getSessionLabel = (sessionType: string) => {
    return sessionType === 'genealogy' ? 'Genealogy Consultation' : 'Standard Research Package';
  };

  const getSessionColor = (sessionType: string) => {
    return sessionType === 'genealogy' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="min-h-screen bg-brand-beige py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/admin')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-brand-green" />
                <h1 className="text-4xl font-bold text-brand-brown">Booking Management</h1>
              </div>
            </div>
            <Button
              onClick={fetchBookings}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
          <p className="text-gray-600">Manage all consultation and research session bookings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Bookings</p>
            <p className="text-3xl font-bold text-brand-brown">{bookings.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Upcoming</p>
            <p className="text-3xl font-bold text-green-600">
              {bookings.filter((b) => {
                const bookingDate = new Date(b.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return bookingDate >= today;
              }).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Past</p>
            <p className="text-3xl font-bold text-gray-600">
              {bookings.filter((b) => {
                const bookingDate = new Date(b.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return bookingDate < today;
              }).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Genealogy</p>
            <p className="text-3xl font-bold text-purple-600">
              {bookings.filter((b) => b.session_type === 'genealogy').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Standard</p>
            <p className="text-3xl font-bold text-blue-600">
              {bookings.filter((b) => b.session_type === 'standard').length}
            </p>
          </div>
        </div>

        {/* Time Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setTimeFilter('upcoming')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                timeFilter === 'upcoming'
                  ? 'text-brand-green border-b-2 border-brand-green bg-green-50'
                  : 'text-gray-600 hover:text-brand-brown hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                Upcoming Bookings
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  timeFilter === 'upcoming' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {bookings.filter((b) => {
                    const bookingDate = new Date(b.date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return bookingDate >= today;
                  }).length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setTimeFilter('past')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                timeFilter === 'past'
                  ? 'text-brand-green border-b-2 border-brand-green bg-green-50'
                  : 'text-gray-600 hover:text-brand-brown hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Past Bookings
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  timeFilter === 'past' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {bookings.filter((b) => {
                    const bookingDate = new Date(b.date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return bookingDate < today;
                  }).length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                timeFilter === 'all'
                  ? 'text-brand-green border-b-2 border-brand-green bg-green-50'
                  : 'text-gray-600 hover:text-brand-brown hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Filter className="w-4 h-4" />
                All Bookings
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  timeFilter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {bookings.length}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-brown mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search by name, email, or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-brown mb-2">
                Session Type
              </label>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={sessionFilter}
                  onChange={(e) => setSessionFilter(e.target.value as 'all' | 'genealogy' | 'standard')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
                >
                  <option value="all">All Sessions</option>
                  <option value="genealogy">Genealogy Consultation</option>
                  <option value="standard">Standard Research</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booked On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || sessionFilter !== 'all'
                        ? 'No bookings match your filters'
                        : 'No bookings yet'}
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium text-brand-brown">
                            <User className="w-4 h-4" />
                            {booking.name}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Mail className="w-4 h-4" />
                            {booking.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSessionColor(booking.session_type)}`}>
                          {getSessionLabel(booking.session_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-2 text-brand-brown">
                            <Calendar className="w-4 h-4" />
                            {new Date(booking.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 mt-1">
                            <Clock className="w-4 h-4" />
                            {booking.time}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(booking.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(booking);
                          }}
                          size="sm"
                          variant="outline"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Booking Detail Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-brand-brown">Booking Details</h2>
                <Button onClick={() => setSelectedBooking(null)} variant="outline" size="sm">
                  Close
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold text-brand-brown mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedBooking.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedBooking.email}</p>
                    <a
                      href={`mailto:${selectedBooking.email}`}
                      className="inline-block mt-2 text-brand-green hover:text-brand-darkgreen underline"
                    >
                      Send Email
                    </a>
                  </div>
                </div>

                {/* Session Details */}
                <div>
                  <h3 className="text-lg font-semibold text-brand-brown mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Session Details
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p>
                      <span className="font-medium">Type:</span>{' '}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSessionColor(selectedBooking.session_type)}`}>
                        {getSessionLabel(selectedBooking.session_type)}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{' '}
                      {new Date(selectedBooking.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p><span className="font-medium">Time:</span> {selectedBooking.time}</p>
                    <p><span className="font-medium">Booked On:</span> {new Date(selectedBooking.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <h3 className="text-lg font-semibold text-brand-brown mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Customer Message
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="whitespace-pre-wrap">{selectedBooking.message || 'No message provided'}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t">
                  <Button
                    onClick={() => window.open(`mailto:${selectedBooking.email}`, '_blank')}
                    className="flex-1 bg-brand-green hover:bg-brand-darkgreen"
                  >
                    Contact Customer
                  </Button>
                  <Button
                    onClick={() => deleteBooking(selectedBooking.id)}
                    variant="outline"
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Delete Booking
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingsPage;
