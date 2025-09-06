import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Users,
  Package,
  Shield,
  TrendingUp,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Search,
  Filter,
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Role verification and redirect logic
  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const session = localStorage.getItem('supabase_session');
        if (!session) {
          router.push('/sign-in?redirect=/dashboard/admin');
          return;
        }

        const sessionData = JSON.parse(session);
        const token = sessionData.access_token;

        // Get user data to verify admin role
        const response = await fetch('/api/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          localStorage.removeItem('supabase_session');
          localStorage.removeItem('user_profile');
          router.push('/sign-in?redirect=/dashboard/admin');
          return;
        }

        const userData = await response.json();

        // If user is not admin, redirect to user dashboard
        if (userData.profile?.role !== 'admin') {
          router.replace('/dashboard/user');
          return;
        }

        setUserProfile(userData.profile);
      } catch (error) {
        console.error('Admin dashboard verification error:', error);
        router.push('/sign-in?redirect=/dashboard/admin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminRole();
  }, [router]);

  // Mock admin data - in production this would come from API
  const adminStats = {
    totalUsers: 1247,
    serviceProviders: 342,
    customers: 905,
    blockedUsers: 8,
    totalListings: 2156,
    activeListings: 1834,
    pendingListings: 45,
    sponsoredListings: 23
  };

  const recentUsers = [
    { id: 1, name: 'John Smith', email: 'john@email.com', type: 'Customer', status: 'Active', joinDate: '2025-01-05' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', type: 'Service Provider', status: 'Active', joinDate: '2025-01-04' },
    { id: 3, name: 'Mike Wilson', email: 'mike@email.com', type: 'Customer', status: 'Blocked', joinDate: '2025-01-03' },
  ];

  const recentListings = [
    { id: 1, title: 'Commercial Pressure Washer', user: 'John Smith', status: 'Pending', category: 'Equipment' },
    { id: 2, title: 'Bin Cleaning Business', user: 'Sarah Johnson', status: 'Active', category: 'Business' },
    { id: 3, title: '2020 Ford F-250 Setup', user: 'Mike Wilson', status: 'Sponsored', category: 'Trucks' },
  ];

  const handleSignOut = async () => {
    try {
      await fetch('/api/signout', { method: 'POST' });
      localStorage.removeItem('supabase_session');
      localStorage.removeItem('user_profile');
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-red-600" />
                <h1 className="text-gray-900 text-2xl font-bold font-sans">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-gray-600 text-base font-normal font-sans">
                Manage users, listings, and platform settings
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Welcome, {userProfile?.full_name}
              </span>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Admin Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-normal font-sans">Total Users</p>
                <p className="text-gray-900 text-2xl font-bold font-sans">
                  {adminStats.totalUsers}
                </p>
                <p className="text-green-600 text-xs font-normal font-sans">
                  +{adminStats.serviceProviders} providers
                </p>
              </div>
            </div>
          </div>

          {/* Total Listings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-normal font-sans">Total Listings</p>
                <p className="text-gray-900 text-2xl font-bold font-sans">
                  {adminStats.totalListings}
                </p>
                <p className="text-green-600 text-xs font-normal font-sans">
                  {adminStats.activeListings} active
                </p>
              </div>
            </div>
          </div>

          {/* Pending Review */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-normal font-sans">Pending Review</p>
                <p className="text-gray-900 text-2xl font-bold font-sans">
                  {adminStats.pendingListings}
                </p>
                <p className="text-yellow-600 text-xs font-normal font-sans">
                  Needs attention
                </p>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-normal font-sans">This Month</p>
                <p className="text-gray-900 text-2xl font-bold font-sans">
                  ${adminStats.sponsoredListings * 50}
                </p>
                <p className="text-purple-600 text-xs font-normal font-sans">
                  +12% from last month
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-gray-900 text-xl font-semibold font-sans">
                Recent Users
              </h2>
              <button className="text-green-600 text-sm hover:text-green-700">
                View All
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="text-gray-900 text-sm font-medium font-sans">
                          {user.name}
                        </h4>
                        <p className="text-gray-500 text-xs font-normal font-sans">
                          {user.email} • {user.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.status === 'Active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status}
                      </span>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Listings */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-gray-900 text-xl font-semibold font-sans">
                Recent Listings
              </h2>
              <button className="text-green-600 text-sm hover:text-green-700">
                View All
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {recentListings.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="text-gray-900 text-sm font-medium font-sans">
                          {listing.title}
                        </h4>
                        <p className="text-gray-500 text-xs font-normal font-sans">
                          by {listing.user} • {listing.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        listing.status === 'Active' ? 'bg-green-100 text-green-700' :
                        listing.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        listing.status === 'Sponsored' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {listing.status}
                      </span>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Management */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-gray-700 text-lg font-semibold font-sans mb-2">
                User Management
              </h3>
              <p className="text-gray-500 text-sm font-normal font-sans mb-4">
                View, edit, and manage user accounts
              </p>
              <button className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Manage Users
              </button>
            </div>
          </div>

          {/* Listing Moderation */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-gray-700 text-lg font-semibold font-sans mb-2">
                Listing Moderation
              </h3>
              <p className="text-gray-500 text-sm font-normal font-sans mb-4">
                Review and moderate platform listings
              </p>
              <button className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Review Listings
              </button>
            </div>
          </div>

          {/* Platform Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-gray-700 text-lg font-semibold font-sans mb-2">
                Platform Settings
              </h3>
              <p className="text-gray-500 text-sm font-normal font-sans mb-4">
                Configure platform rules and settings
              </p>
              <button className="bg-purple-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Pending Listings Table */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-gray-900 text-xl font-semibold font-sans">
              Pending Listings Review
            </h2>
            <p className="text-gray-500 text-sm font-normal font-sans">
              Listings awaiting moderation approval
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {recentListings.filter(l => l.status === 'Pending').map((listing) => (
                <div key={listing.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="text-gray-900 text-base font-medium font-sans">
                        {listing.title}
                      </h4>
                      <p className="text-gray-500 text-sm font-normal font-sans">
                        Posted by {listing.user} • {listing.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {recentListings.filter(l => l.status === 'Pending').length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-gray-700 text-lg font-medium font-sans mb-2">
                  All caught up!
                </h3>
                <p className="text-gray-500 text-base font-normal font-sans">
                  No listings pending review at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}