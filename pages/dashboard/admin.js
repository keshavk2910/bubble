import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Search,
  Bell,
  Download,
  MoreHorizontal,
  Users,
  FileText,
  BarChart3,
  Settings,
  Tag,
  User,
  LogOut,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Home,
} from 'lucide-react';

import ListingsTable from '../../components/ListingsTable';
import UsersTable from '../../components/UsersTable';

export default function AdminDashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminStats, setAdminStats] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);

  // Load admin data
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const session = localStorage.getItem('supabase_session');
        if (!session) {
          router.push('/sign-in?redirect=/dashboard/admin');
          return;
        }

        const sessionData = JSON.parse(session);
        const token = sessionData.access_token;

        // Verify admin role
        const userResponse = await fetch('/api/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!userResponse.ok) {
          router.push('/sign-in?redirect=/dashboard/admin');
          return;
        }

        const userData = await userResponse.json();
        if (userData.profile?.role !== 'admin') {
          router.replace('/dashboard/user');
          return;
        }

        setUserProfile(userData.profile);

        // Load admin stats, listings, users, and analytics in parallel
        const [
          statsResponse,
          listingsResponse,
          usersResponse,
          analyticsResponse,
        ] = await Promise.all([
          fetch('/api/stats', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(`/api/admin/listings?limit=50&include_deleted=true`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch('/api/admin/users?limit=10', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch('/api/admin/analytics', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setAdminStats(statsData.stats);
        }

        if (listingsResponse.ok) {
          const listingsData = await listingsResponse.json();
          setListings(listingsData.listings);
        }

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.users);
        }

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          setAnalytics(analyticsData.analytics);
        }
      } catch (error) {
        console.error('Admin dashboard loading error:', error);
        router.push('/sign-in?redirect=/dashboard/admin');
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, [router]);

  // Reload listings when deleted filter changes
  useEffect(() => {
    const reloadListings = async () => {
      if (!userProfile) return;

      try {
        const session = localStorage.getItem('supabase_session');
        const sessionData = JSON.parse(session);
        const token = sessionData.access_token;

        const params = new URLSearchParams();
        params.append('limit', '50');
        params.append('include_deleted', 'true');
        if (showDeleted) {
          params.append('deleted_only', 'true');
        }

        const response = await fetch(`/api/admin/listings?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setListings(data.listings);
        }
      } catch (error) {
        console.error('Reload listings error:', error);
      }
    };

    reloadListings();
  }, [showDeleted, userProfile]);

  // Handler functions for real functionality
  const handleStatusChange = async (listingId, newStatus) => {
    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const response = await fetch(`/api/admin/listings/${listingId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setListings((prev) =>
          prev.map((listing) =>
            listing.id === listingId
              ? { ...listing, status: newStatus }
              : listing
          )
        );
      }
    } catch (error) {
      console.error('Status change error:', error);
    }
  };

  const handleApprove = (listing) => {
    handleStatusChange(listing.id, 'active');
  };

  const handleReject = (listing) => {
    handleStatusChange(listing.id, 'inactive');
  };

  const handleEditListing = (listing) => {
    router.push(`/dashboard/edit-listing/${listing.id}`);
  };

  const handleDeleteListing = (listing) => {
    handleStatusChange(listing.id, 'deleted');
  };

  const handleViewListing = (listing) => {
    window.open(`/listing/${listing.slug || listing.id}`, '_blank');
  };

  const handleRecoverListing = (listing) => {
    handleStatusChange(listing.id, 'active');
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'sponsored':
        return 'bg-blue-100 text-blue-700';
      case 'bubble binz':
        return 'bg-purple-100 text-purple-700';
      case 'inactive':
        return 'bg-red-100 text-red-700';
      case 'new':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleExport = () => {
    console.log('Exporting data...');
    // Handle export functionality
  };

  return (
    <div className='min-h-screen bg-gray-50 flex'>
      {/* Admin Sidebar */}
      <div className='fixed left-0 top-0 w-60 h-screen bg-green-600 flex flex-col z-40'>
        {/* Logo */}
        <div className='px-6 py-6 border-b border-green-500'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-white rounded-full flex items-center justify-center'>
              <span className='text-green-600 text-sm font-bold'>B</span>
            </div>
            <h1 className='text-white text-lg font-bold font-sans'>
              Bubblebinz
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className='flex-1 px-4 py-6 space-y-2'>
          <div className='flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left bg-green-700 text-white'>
            <Home className='w-5 h-5' />
            <span className='font-sans'>Dashboard</span>
          </div>

          <Link
            href='/dashboard/listings'
            className='flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors text-green-100 hover:bg-green-700 hover:text-white'
          >
            <FileText className='w-5 h-5' />
            <span className='font-sans'>Listings</span>
          </Link>

          <Link
            href='/dashboard/users'
            className='flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors text-green-100 hover:bg-green-700 hover:text-white'
          >
            <Users className='w-5 h-5' />
            <span className='font-sans'>Users</span>
          </Link>

          <Link
            href='/dashboard/tags'
            className='flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors text-green-100 hover:bg-green-700 hover:text-white'
          >
            <Tag className='w-5 h-5' />
            <span className='font-sans'>Tags</span>
          </Link>

          <Link
            href='/dashboard/analytics'
            className='flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors text-green-100 hover:bg-green-700 hover:text-white'
          >
            <BarChart3 className='w-5 h-5' />
            <span className='font-sans'>Analytics</span>
          </Link>

          <Link
            href='/dashboard/settings'
            className='flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors text-green-100 hover:bg-green-700 hover:text-white'
          >
            <Settings className='w-5 h-5' />
            <span className='font-sans'>Settings</span>
          </Link>
        </nav>

        {/* Admin User Info */}
        <div className='px-4 py-6 border-t border-green-500'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-8 h-8 bg-green-700 rounded-full flex items-center justify-center'>
              <span className='text-white text-xs font-bold'>
                {userProfile?.full_name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase() || 'AD'}
              </span>
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-white text-sm font-medium truncate'>
                {userProfile?.display_name ||
                  userProfile?.full_name ||
                  'Admin User'}
              </p>
              <p className='text-green-200 text-xs truncate'>Administrator</p>
            </div>
          </div>

          <button className='flex items-center gap-3 w-full px-4 py-3 text-green-100 hover:bg-green-700 hover:text-white rounded-lg transition-colors text-left'>
            <LogOut className='w-4 h-4' />
            <span className='text-sm font-sans'>Log out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 ml-60'>
        {/* Header */}
        <header className='sticky top-0 bg-white border-b border-gray-200 px-6 py-5 z-30'>
          <div className='flex items-center justify-between'>
            <h1 className='text-gray-700 text-2xl font-normal font-sans leading-loose'>
              Admin Control Center
            </h1>

            <div className='flex items-center gap-4'>
              {/* Search */}
              <div className='relative'>
                <Search className='w-4 h-4 text-gray-400 absolute left-3 top-3' />
                <input
                  type='text'
                  placeholder='Search...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-80 pl-10 pr-4 py-2 bg-white rounded-md border border-gray-300 text-gray-400 text-base font-normal font-sans focus:outline-none focus:ring-2 focus:ring-green-600'
                />
              </div>

              {/* Notifications */}
              <div className='relative'>
                <button className='p-2 text-gray-600 hover:text-gray-800'>
                  <Bell className='w-5 h-5' />
                  <span className='absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full'></span>
                </button>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                className='bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700 transition-colors'
              >
                <Download className='w-4 h-4' />
                <span className='text-base font-normal font-sans'>Export</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className='p-6'>
          <div className='max-w-7xl mx-auto'>
            {/* Content Area */}
            <div className='grid grid-cols-1 xl:grid-cols-4 gap-6'>
              {/* Main Tables Section */}
              <div className='xl:col-span-3 space-y-6'>
                {/* Listings Management */}
                <div className='bg-white rounded-lg border border-gray-200'>
                  <div className='px-6 py-4 border-b border-gray-200'>
                    <div className='flex items-center justify-between'>
                      <h2 className='text-gray-900 text-lg font-semibold font-sans'>
                        Listings Management
                      </h2>
                      <button
                        onClick={() => setShowDeleted(!showDeleted)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          showDeleted
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        <Trash2 className='w-4 h-4' />
                        {showDeleted ? 'Show All Listings' : 'Trash'}
                      </button>
                    </div>
                  </div>
                  <ListingsTable
                    listings={
                      showDeleted
                        ? listings.filter((l) => l.status === 'deleted')
                        : listings.filter((l) => l.status !== 'deleted')
                    }
                    isLoading={isLoading}
                    onEdit={handleEditListing}
                    onDelete={handleDeleteListing}
                    onView={handleViewListing}
                    onStatusChange={handleStatusChange}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onRecover={handleRecoverListing}
                  />
                </div>

                {/* Users Management */}
                <div className='bg-white rounded-lg border border-gray-200'>
                  <div className='px-6 py-4 border-b border-gray-200'>
                    <h2 className='text-gray-900 text-lg font-semibold font-sans'>
                      Users Management
                    </h2>
                  </div>
                  <UsersTable
                    users={users}
                    isLoading={isLoading}
                    onEdit={(user) => console.log('Edit user:', user)}
                    onDelete={(user) => console.log('Delete user:', user)}
                    onView={(user) => console.log('View user:', user)}
                  />
                </div>
              </div>

              {/* Right Sidebar - Analytics */}
              <div className='space-y-6'>
                {/* User Insights */}
                <div className='bg-white rounded-lg border border-gray-200 p-6'>
                  <h3 className='text-gray-900 text-lg font-semibold font-sans mb-4'>
                    User Insights
                  </h3>

                  <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-600 text-sm'>Total Users</span>
                      <span className='text-gray-900 text-2xl font-bold'>
                        {isLoading ? '...' : adminStats.totalUsers || 0}
                      </span>
                    </div>

                    <div className='flex justify-between items-center'>
                      <div>
                        <div className='text-gray-600 text-sm'>
                          Service Providers
                        </div>
                        <div className='text-gray-600 text-sm'>
                          New This Month
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='text-gray-900 text-lg font-semibold'>
                          {isLoading
                            ? '...'
                            : analytics.userInsights?.serviceProviders || 0}
                        </div>
                        <div className='text-gray-900 text-lg font-semibold'>
                          {isLoading
                            ? '...'
                            : analytics.userInsights?.newUsersThisMonth || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* New Registrations Chart */}
                <div className='bg-white rounded-lg border border-gray-200 p-6'>
                  <h3 className='text-gray-900 text-lg font-semibold font-sans mb-4'>
                    New Registrations
                  </h3>

                  {/* Real Monthly Data */}
                  <div className='space-y-2'>
                    {isLoading ? (
                      <div className='text-center py-8'>
                        <div className='w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto'></div>
                      </div>
                    ) : analytics.monthlyRegistrations ? (
                      analytics.monthlyRegistrations
                        .slice(-6)
                        .map((month, index) => (
                          <div
                            key={index}
                            className='flex items-center justify-between'
                          >
                            <span className='text-gray-600 text-xs'>
                              {month.month}
                            </span>
                            <div className='flex items-center gap-2'>
                              <div
                                className='bg-green-500 rounded h-2'
                                style={{
                                  width: `${Math.max(
                                    month.registrations * 10,
                                    10
                                  )}px`,
                                  maxWidth: '80px',
                                }}
                              ></div>
                              <span className='text-gray-900 text-sm font-medium w-8 text-right'>
                                {month.registrations}
                              </span>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className='text-center py-4 text-gray-500 text-sm'>
                        No registration data available
                      </div>
                    )}
                  </div>
                </div>

                {/* User Activity */}
                <div className='bg-white rounded-lg border border-gray-200 p-6'>
                  <h3 className='text-gray-900 text-lg font-semibold font-sans mb-4'>
                    User Activity (This Month)
                  </h3>

                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-600 text-sm'>
                        New Listings
                      </span>
                      <span className='text-gray-900 text-lg font-semibold'>
                        {isLoading
                          ? '...'
                          : analytics.userActivity?.newListingsPosted || 0}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-600 text-sm'>
                        Active Sellers
                      </span>
                      <span className='text-gray-900 text-lg font-semibold'>
                        {isLoading
                          ? '...'
                          : analytics.userActivity?.uniqueListingUsers || 0}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-600 text-sm'>
                        Messages Sent
                      </span>
                      <span className='text-gray-900 text-lg font-semibold'>
                        {isLoading
                          ? '...'
                          : analytics.userActivity?.totalMessages || 0}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-600 text-sm'>
                        Active Messagers
                      </span>
                      <span className='text-gray-900 text-lg font-semibold'>
                        {isLoading
                          ? '...'
                          : analytics.userActivity?.uniqueMessageUsers || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Types Distribution */}
                <div className='bg-white rounded-lg border border-gray-200 p-6'>
                  <h3 className='text-gray-900 text-lg font-semibold font-sans mb-4'>
                    User Types
                  </h3>

                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                        <span className='text-gray-700 text-sm'>
                          Service Providers
                        </span>
                      </div>
                      <span className='text-gray-900 text-sm font-semibold'>
                        {isLoading
                          ? '...'
                          : analytics.userTypeDistribution?.service_provider ||
                            0}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
                        <span className='text-gray-700 text-sm'>Customers</span>
                      </div>
                      <span className='text-gray-900 text-sm font-semibold'>
                        {isLoading
                          ? '...'
                          : analytics.userTypeDistribution?.customer || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Geographic Distribution */}
                <div className='bg-white rounded-lg border border-gray-200 p-6'>
                  <h3 className='text-gray-900 text-lg font-semibold font-sans mb-4'>
                    Geographic Distribution
                  </h3>

                  <div className='space-y-2'>
                    {isLoading ? (
                      <div className='text-center py-4'>
                        <div className='w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto'></div>
                      </div>
                    ) : analytics.geographicDistribution ? (
                      analytics.geographicDistribution
                        .slice(0, 5)
                        .map((location, index) => (
                          <div
                            key={index}
                            className='flex items-center justify-between'
                          >
                            <span className='text-gray-700 text-sm'>
                              {location.country}
                            </span>
                            <div className='flex items-center gap-2'>
                              <div
                                className='bg-blue-500 rounded h-2'
                                style={{
                                  width: `${Math.max(
                                    location.users * 5,
                                    10
                                  )}px`,
                                  maxWidth: '60px',
                                }}
                              ></div>
                              <span className='text-gray-900 text-sm font-medium w-8 text-right'>
                                {location.users}
                              </span>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className='text-center py-4 text-gray-500 text-sm'>
                        No geographic data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Geographic Distribution */}
                <div className='bg-white rounded-lg border border-gray-200 p-6'>
                  <h3 className='text-gray-900 text-lg font-semibold font-sans mb-4'>
                    Geographic Distribution
                  </h3>

                  <div className='space-y-3'>
                    {[
                      { country: 'United States', percentage: 45 },
                      { country: 'Canada', percentage: 25 },
                      { country: 'United Kingdom', percentage: 15 },
                      { country: 'Australia', percentage: 10 },
                      { country: 'Other', percentage: 5 },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between'
                      >
                        <div className='flex items-center gap-2'>
                          <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                          <span className='text-gray-700 text-xs font-normal font-sans'>
                            {item.country}
                          </span>
                        </div>
                        <span className='text-gray-600 text-xs font-normal font-sans'>
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
