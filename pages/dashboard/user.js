import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';

import {
  Eye,
  Search,
  Filter,
  Calendar,
  Edit,
  Trash2,
  Heart,
  MoreHorizontal,
  Plus,
  CheckCircle,
  MessageCircle,
  Package,
  Wrench,
  Truck,
  Building2,
  Settings,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import EmailVerificationModal from '../../components/EmailVerificationModal';
import SmsVerificationModal from '../../components/SmsVerificationModal';
import Link from 'next/link';
export default function UserDashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [userProfile, setUserProfile] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [highlightListings, setHighlightListings] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    listing: null,
  });
  const [editingListing, setEditingListing] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  // Role verification and redirect logic
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const session = localStorage.getItem('supabase_session');
        if (!session) {
          router.push('/sign-in?redirect=/dashboard/user');
          return;
        }

        const sessionData = JSON.parse(session);
        const token = sessionData.access_token;

        // Get user data to verify role
        const response = await fetch('/api/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          localStorage.removeItem('supabase_session');
          localStorage.removeItem('user_profile');
          router.push('/sign-in?redirect=/dashboard/user');
          return;
        }

        const userData = await response.json();

        // If user is admin, redirect to admin dashboard
        if (userData.profile?.role === 'admin') {
          router.replace('/dashboard/admin');
          return;
        }

        // Check if phone is verified before allowing dashboard access
        if (!userData.profile?.phone_verified) {
          // Store profile for verification page
          localStorage.setItem(
            'temp_unverified_profile',
            JSON.stringify(userData.profile)
          );
          localStorage.setItem(
            'temp_session',
            JSON.stringify({
              access_token: sessionData.access_token,
              refresh_token: sessionData.refresh_token,
              expires_at: sessionData.expires_at,
            })
          );
          router.push('/verify-phone-required');
          return;
        }

        setUserProfile(userData.profile);

        // Load stats separately after dashboard is loaded
        loadDashboardStats(sessionData.access_token);

        // Set flag to load listings after profile is set
        // Listings will be loaded by the separate useEffect
      } catch (error) {
        console.error('Dashboard verification error:', error);
        router.push('/sign-in?redirect=/dashboard/user');
      } finally {
        setIsLoading(false);
      }
    };

    const loadDashboardStats = async (token) => {
      try {
        const statsResponse = await fetch('/api/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setDashboardStats(statsData.stats);
        }
      } catch (error) {
        console.error('Stats loading error:', error);
        // Don't fail the dashboard if stats can&apos;t load
      } finally {
        setStatsLoading(false);
      }
    };

    checkUserRole();
  }, [router]);

  // Separate useEffect for loading listings
  useEffect(() => {
    const loadUserListings = async (
      token,
      searchQuery = '',
      statusFilter = ''
    ) => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (statusFilter && statusFilter !== 'all')
          params.append('status', statusFilter);

        const response = await fetch(`/api/listings?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserListings(data.listings);
        } else {
          console.error('Failed to load listings');
        }
      } catch (error) {
        console.error('Listings loading error:', error);
      } finally {
        setListingsLoading(false);
      }
    };

    const session = localStorage.getItem('supabase_session');
    if (session && userProfile) {
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      setListingsLoading(true);
      loadUserListings(token, '', ''); // Initial load without filters
    }
  }, [userProfile]);

  // Handle highlight animation from URL parameter
  useEffect(() => {
    const { highlight } = router.query;
    if (highlight === 'listings') {
      setHighlightListings(true);

      // Scroll to listings section
      setTimeout(() => {
        const listingsSection = document.getElementById('my-listings-section');
        if (listingsSection) {
          listingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100); // Small delay to ensure DOM is ready

      // Remove highlight after 2 seconds
      const timer = setTimeout(() => {
        setHighlightListings(false);
        // Clean up URL parameter
        router.replace('/dashboard/user', undefined, { shallow: true });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [router.query, router]);

  // Handle search and filter changes
  useEffect(() => {
    const loadFilteredListings = async () => {
      const session = localStorage.getItem('supabase_session');
      if (session && userProfile) {
        const sessionData = JSON.parse(session);
        const token = sessionData.access_token;

        setListingsLoading(true);

        try {
          const params = new URLSearchParams();
          if (searchTerm) params.append('search', searchTerm);
          if (statusFilter && statusFilter !== 'all')
            params.append('status', statusFilter);

          const response = await fetch(`/api/listings?${params}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUserListings(data.listings);
          }
        } catch (error) {
          console.error('Filter listings error:', error);
        } finally {
          setListingsLoading(false);
        }
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(loadFilteredListings, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, userProfile]);

  const handleDeleteListing = async (listing) => {
    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const response = await fetch(`/api/listings?listingId=${listing.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remove from local state
        setUserListings((prev) => prev.filter((l) => l.id !== listing.id));
        setDeleteConfirm({ show: false, listing: null });

        // Refresh stats
        loadDashboardStats(token);
      } else {
        console.error('Failed to delete listing');
      }
    } catch (error) {
      console.error('Delete listing error:', error);
    }
  };

  const handleEditListing = (listing) => {
    router.push(`/dashboard/edit-listing/${listing.id}`);
  };

  const handleVerifyEmail = () => {
    setShowEmailModal(true);
  };

  const handleEmailVerified = async () => {
    // Refresh user profile to get updated verification status
    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const response = await fetch('/api/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUserProfile(userData.profile);
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
    }
  };

  const handleVerifyPhone = () => {
    setShowPhoneModal(true);
  };

  const handlePhoneVerified = async () => {
    // Refresh user profile to get updated verification status
    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const response = await fetch('/api/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUserProfile(userData.profile);
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'sponsored':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'bins_buy_sell':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      <Head>
        <title>Dashboard - Bins Buy Sell</title>
        <meta
          name='description'
          content='Manage your listings, view statistics, and track your marketplace activity.'
        />
      </Head>
      <DashboardLayout
        title='Your Dashboard'
        subtitle="Welcome back! Here's an overview of your listings"
      >
        <div className='max-w-7xl mx-auto'>
          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            {/* My Listings Card */}
            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-gray-700 text-lg font-normal font-sans leading-7'>
                  My Listings
                </h3>
                <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
                  <div className='w-6 h-6 bg-green-600 rounded-full flex items-center justify-center'>
                    <span className='text-white text-sm font-bold'>
                      {statsLoading
                        ? '...'
                        : dashboardStats?.total_listings || 0}
                    </span>
                  </div>
                </div>
              </div>
              <p className='text-gray-500 text-sm font-normal font-sans mb-4'>
                Total active and pending listings
              </p>
              <div className='flex justify-between text-sm'>
                <div>
                  <span className='text-gray-500'>Active</span>
                  <div className='text-2xl font-semibold text-gray-900'>
                    {statsLoading ? (
                      <div className='w-6 h-6 border-2 border-gray-200 border-t-green-600 rounded-full animate-spin'></div>
                    ) : (
                      dashboardStats?.active_listings || 0
                    )}
                  </div>
                </div>
                <div>
                  <span className='text-gray-500'>Pending</span>
                  <div className='text-2xl font-semibold text-gray-900'>
                    {statsLoading ? (
                      <div className='w-6 h-6 border-2 border-gray-200 border-t-green-600 rounded-full animate-spin'></div>
                    ) : (
                      dashboardStats?.draft_listings || 0
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-gray-700 text-lg font-normal font-sans leading-7'>
                  Verification Status
                </h3>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    userProfile?.phone_verified && userProfile?.email_verified
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {userProfile?.phone_verified && userProfile?.email_verified
                    ? 'Complete'
                    : 'Pending'}
                </span>
              </div>
              <p className='text-gray-500 text-sm font-normal font-sans mb-4'>
                Your account verification progress
              </p>

              {/* Progress Bar */}
              <div className='w-full bg-gray-200 rounded-full h-1 mb-4'>
                <div
                  className={`h-1 rounded-full transition-all duration-500 ${(() => {
                    const emailVerified = userProfile?.email_verified;
                    const phoneVerified = userProfile?.phone_verified;

                    if (emailVerified && phoneVerified)
                      return 'bg-green-600 w-full';
                    if (emailVerified || phoneVerified)
                      return 'bg-yellow-500 w-1/2';
                    return 'bg-red-500 w-1/4';
                  })()}`}
                ></div>
              </div>

              {/* Verification Items */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    {userProfile?.email_verified ? (
                      <CheckCircle className='w-4 h-4 text-green-600' />
                    ) : (
                      <div className='w-4 h-4 border-2 border-yellow-500 rounded-full flex items-center justify-center'>
                        <div className='w-1.5 h-1.5 bg-yellow-500 rounded-full'></div>
                      </div>
                    )}
                    <span
                      className={`text-sm ${
                        userProfile?.email_verified
                          ? 'text-gray-700'
                          : 'text-yellow-600'
                      }`}
                    >
                      Email{' '}
                      {!userProfile?.email_verified && '(Required for posting)'}
                    </span>
                  </div>
                  {!userProfile?.email_verified && (
                    <button
                      onClick={handleVerifyEmail}
                      className='text-xs text-green-600 hover:text-green-700 font-medium'
                    >
                      Verify
                    </button>
                  )}
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    {userProfile?.phone_verified ? (
                      <CheckCircle className='w-4 h-4 text-green-600' />
                    ) : (
                      <div className='w-4 h-4 border-2 border-yellow-500 rounded-full flex items-center justify-center'>
                        <div className='w-1.5 h-1.5 bg-yellow-500 rounded-full'></div>
                      </div>
                    )}
                    <span
                      className={`text-sm ${
                        userProfile?.phone_verified
                          ? 'text-gray-700'
                          : 'text-yellow-600'
                      }`}
                    >
                      Phone{' '}
                      {!userProfile?.phone_verified && '(Required for login)'}
                    </span>
                  </div>
                  {!userProfile?.phone_verified && (
                    <button
                      onClick={handleVerifyPhone}
                      className='text-xs text-green-600 hover:text-green-700 font-medium'
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <div className='text-center'>
                <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Plus className='w-6 h-6 text-green-600' />
                </div>
                <h3 className='text-gray-700 text-lg font-normal font-sans leading-7 mb-2'>
                  Ready to Sell?
                </h3>
                <p className='text-gray-500 text-sm font-normal font-sans mb-4'>
                  Create a new listing to reach thousands of buyers
                </p>
                <Link href='/dashboard/post-new-listing'>
                  <button className='bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors'>
                    Create New Listing
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* My Listings Section */}
          <div
            id='my-listings-section'
            className={`bg-white rounded-xl border transition-all duration-500 ${
              highlightListings ? 'animate-ripple-highlight' : 'border-gray-200'
            }`}
          >
            {/* Section Header */}
            <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
              <div>
                <h2 className='text-gray-900 text-xl font-semibold font-sans'>
                  My Listings
                </h2>
              </div>
              <Link href='/dashboard/post-new-listing'>
                <button className='bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2'>
                  <Plus className='w-4 h-4' />
                  Create New Listing
                </button>
              </Link>
            </div>

            {/* Filters */}
            <div className='px-6 py-4 border-b border-gray-200 flex items-center gap-4'>
              {/* Search */}
              <div className='relative flex-1 max-w-md'>
                <Search className='w-4 h-4 text-gray-400 absolute left-3 top-3' />
                <input
                  type='text'
                  placeholder='Search listings...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600'
                />
              </div>

              {/* Status Filter */}
              <div className='flex items-center gap-2'>
                <Filter className='w-4 h-4 text-gray-400' />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className='border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600'
                >
                  <option value='all'>All Status</option>
                  <option value='active'>Active</option>
                  <option value='pending'>Pending Review</option>
                  <option value='inactive'>Inactive</option>
                  <option value='sponsored'>Sponsored</option>
                </select>
              </div>

              {/* Date Range */}
              <div className='flex items-center gap-2'>
                <Calendar className='w-4 h-4 text-gray-400' />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className='border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600'
                >
                  <option value='all'>Date Range</option>
                  <option value='today'>Today</option>
                  <option value='week'>This Week</option>
                  <option value='month'>This Month</option>
                </select>
              </div>
            </div>

            {/* Listings Table */}
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Listing
                    </th>
                    <th className='text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Category
                    </th>
                    <th className='text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Date Added
                    </th>
                    <th className='text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {listingsLoading ? (
                    <tr>
                      <td colSpan='5' className='px-6 py-12 text-center'>
                        <div className='w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                        <p className='text-gray-500'>
                          Loading your listings...
                        </p>
                      </td>
                    </tr>
                  ) : userListings.length === 0 ? (
                    <tr>
                      <td colSpan='5' className='px-6 py-12 text-center'>
                        <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                          <Package className='w-8 h-8 text-gray-400' />
                        </div>
                        <h3 className='text-gray-700 text-lg font-medium font-sans mb-2'>
                          No listings yet
                        </h3>
                        <p className='text-gray-500 text-base font-normal font-sans mb-4'>
                          Create your first listing to start selling.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    userListings.map((listing) => (
                      <tr
                        key={listing.id}
                        className='hover:bg-gray-50 transition-colors'
                      >
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3'>
                            <div className='w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0'>
                              {listing.main_image ? (
                                <Image
                                  src={listing.main_image}
                                  alt={listing.title}
                                  width={48}
                                  height={48}
                                  className='w-full h-full object-cover'
                                />
                              ) : (
                                <div className='w-full h-full flex items-center justify-center'>
                                  {getCategoryIconForPlaceholder(listing.category)}
                                </div>
                              )}
                            </div>
                            <div className='min-w-0'>
                              <a
                                href={`/listing/${listing.slug}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-gray-900 text-sm font-medium font-sans truncate hover:text-green-600 transition-colors'
                              >
                                {listing.title} (
                                {listing.display_id ||
                                  `BZ-${listing.listing_id}`}
                                )
                              </a>
                              <p className='text-gray-500 text-xs font-normal font-sans truncate'>
                                ${listing.price?.toLocaleString()} •{' '}
                                {listing.condition}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <span className='inline-flex items-center gap-2 text-sm'>
                            {getCategoryIcon(listing.category)}
                            <span className='text-gray-700 font-normal font-sans'>
                              {formatCategoryDisplay(listing.category)}
                            </span>
                          </span>
                        </td>
                        <td className='px-6 py-4'>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                              listing.status
                            )}`}
                          >
                            {formatStatusDisplay(listing.status)}
                          </span>
                        </td>
                        <td className='px-6 py-4'>
                          <span className='text-gray-500 text-sm font-normal font-sans'>
                            {new Date(listing.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className='px-6 py-4 text-right'>
                          <div className='flex items-center justify-end gap-2'>
                            <a
                              href={`/listing/${listing.slug}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='p-1 text-gray-400 hover:text-blue-600 transition-colors'
                              title='View listing'
                            >
                              <Eye className='w-4 h-4' />
                            </a>
                            <button
                              onClick={() => handleEditListing(listing)}
                              className='p-1 text-gray-400 hover:text-gray-600 transition-colors'
                              title='Edit listing'
                            >
                              <Edit className='w-4 h-4' />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({ show: true, listing })
                              }
                              className='p-1 text-gray-400 hover:text-red-600 transition-colors'
                              title='Delete listing'
                            >
                              <Trash2 className='w-4 h-4' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
              <p className='text-sm text-gray-500'>
                Showing {userListings.length} of {userListings.length} entries
              </p>
              <div className='flex items-center gap-2'>
                <button className='w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-50'>
                  &lt;
                </button>
                <button className='w-8 h-8 flex items-center justify-center rounded bg-green-600 text-white'>
                  1
                </button>
                <button className='w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-50'>
                  2
                </button>
                <button className='w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-50'>
                  3
                </button>
                <button className='w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-50'>
                  &gt;
                </button>
              </div>
            </div>
          </div>

          {/* Saved Listings Section */}
          <div className='bg-white rounded-xl border border-gray-200 mt-8'>
            {/* Section Header */}
            <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
              <div>
                <h2 className='text-gray-900 text-xl font-semibold font-sans'>
                  Saved Listings
                </h2>
              </div>
              <button className='text-gray-500 text-sm hover:text-gray-700'>
                View All
              </button>
            </div>

            {/* Saved Listings Content */}
            <div className='p-6'>
              <div className='text-center py-12'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Heart className='w-8 h-8 text-gray-400' />
                </div>
                <h3 className='text-gray-700 text-lg font-medium font-sans mb-2'>
                  No listings saved yet
                </h3>
                <p className='text-gray-500 text-base font-normal font-sans mb-4'>
                  Start browsing to save listings you&apos;re interested in.
                </p>
                <button
                  onClick={() => router.push('/browse-listings')}
                  className='bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors'
                >
                  Browse Listings
                </button>
              </div>
            </div>
          </div>

          {/* Leads Section */}
          <div className='bg-white rounded-xl border border-gray-200 mt-8 p-6'>
            <div className='text-center py-12'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <MessageCircle className='w-8 h-8 text-gray-400' />
              </div>
              <h3 className='text-gray-700 text-lg font-normal font-sans leading-7 mb-2'>
                Leads
              </h3>
              <span className='bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full mb-4 inline-block'>
                Coming Soon
              </span>
              <div className='max-w-md mx-auto'>
                <h4 className='text-gray-900 text-base font-medium font-sans mb-2'>
                  Lead Management
                </h4>
                <p className='text-gray-500 text-sm font-normal font-sans mb-4'>
                  Track and manage inquiries about your listings. Respond faster
                  and close more deals.
                </p>
                <button className='bg-gray-100 text-gray-500 text-sm font-medium px-4 py-2 rounded-lg cursor-not-allowed'>
                  Available in Premium Plan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-xl p-6 max-w-md w-full'>
              <div className='text-center mb-6'>
                <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Trash2 className='w-6 h-6 text-red-600' />
                </div>
                <h3 className='text-gray-900 text-lg font-semibold font-sans mb-2'>
                  Delete Listing
                </h3>
                <p className='text-gray-600 text-base font-normal font-sans mb-4'>
                  Are you sure you want to delete &quot;
                  {deleteConfirm.listing?.title}
                  &quot;?
                </p>
                <p className='text-gray-500 text-sm font-normal font-sans'>
                  This will hide the listing from buyers. You can contact admin
                  to restore it if needed.
                </p>
              </div>

              <div className='flex gap-3'>
                <button
                  onClick={() =>
                    setDeleteConfirm({ show: false, listing: null })
                  }
                  className='flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteListing(deleteConfirm.listing)}
                  className='flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors'
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Verification Modal */}
        <EmailVerificationModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          email={userProfile?.email}
          onVerified={handleEmailVerified}
        />

        {/* Phone Verification Modal */}
        <SmsVerificationModal
          isOpen={showPhoneModal}
          onClose={() => setShowPhoneModal(false)}
          phoneNumber={userProfile?.phone}
          onVerified={handlePhoneVerified}
        />
      </DashboardLayout>
    </>
  );
}

function getCategoryIcon(category) {
  const iconProps = 'w-5 h-5 text-gray-600';

  const icons = {
    equipment: <Wrench className={iconProps} />,
    truck: <Truck className={iconProps} />,
    'trucks-vehicles': <Truck className={iconProps} />,
    business: <Building2 className={iconProps} />,
    'complete-business': <Building2 className={iconProps} />,
    parts: <Settings className={iconProps} />,
    'parts-accessories': <Settings className={iconProps} />,
    // Legacy support for old format
    Business: <Building2 className={iconProps} />,
    Equipment: <Wrench className={iconProps} />,
    Vehicles: <Truck className={iconProps} />,
    Commercial: <Building2 className={iconProps} />,
  };
  return icons[category] || <Package className={iconProps} />;
}

function getCategoryIconForPlaceholder(category) {
  const iconProps = 'w-6 h-6 text-gray-400';

  const icons = {
    equipment: <Wrench className={iconProps} />,
    truck: <Truck className={iconProps} />,
    'trucks-vehicles': <Truck className={iconProps} />,
    business: <Building2 className={iconProps} />,
    'complete-business': <Building2 className={iconProps} />,
    parts: <Settings className={iconProps} />,
    'parts-accessories': <Settings className={iconProps} />,
    // Legacy support for old format
    Business: <Building2 className={iconProps} />,
    Equipment: <Wrench className={iconProps} />,
    Vehicles: <Truck className={iconProps} />,
    Commercial: <Building2 className={iconProps} />,
  };
  return icons[category] || <Package className={iconProps} />;
}

function formatCategoryDisplay(category) {
  const categoryMap = {
    equipment: 'Equipment',
    'trucks-vehicles': 'Trucks & Vehicles',
    'complete-business': 'Complete Business',
    'parts-accessories': 'Parts & Accessories',
  };
  return categoryMap[category] || category;
}

function formatStatusDisplay(status) {
  const statusMap = {
    pending: 'Pending Review',
    active: 'Active',
    inactive: 'Inactive',
    sponsored: 'Sponsored',
    bins_buy_sell: 'Bins Buy Sell',
  };
  return statusMap[status] || status;
}
