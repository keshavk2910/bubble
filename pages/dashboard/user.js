import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import {
  Bell,
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
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Link from 'next/link';
export default function UserDashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [userProfile, setUserProfile] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

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
            'Authorization': `Bearer ${token}`,
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

        setUserProfile(userData.profile);
        
        // Load stats separately after dashboard is loaded
        loadDashboardStats(sessionData.access_token);
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
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setDashboardStats(statsData.stats);
        }
      } catch (error) {
        console.error('Stats loading error:', error);
        // Don't fail the dashboard if stats can't load
      } finally {
        setStatsLoading(false);
      }
    };

    checkUserRole();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Mock user data
  const user = {
    name: 'John Smith',
    avatar: '/api/placeholder/40/40',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    emailVerified: true,
    phoneVerified: true,
  };

  // Mock listings data
  const listings = [
    {
      id: 1,
      title: 'HOA Community Bin Maintenance',
      subtitle: '2 bed, 2 bath, fully furnished',
      category: 'Business',
      status: 'Active',
      dateAdded: 'Jan 15, 2023',
      image: '/FRAME.png',
      views: 245,
      saves: 12,
    },
    {
      id: 2,
      title: 'Commercial Dumpster Deep Clean',
      subtitle: 'M2 Max, 32GB RAM, 1TB SSD',
      category: 'Equipment',
      status: 'Active',
      dateAdded: 'Feb 3, 2023',
      image: '/FRAME-1.png',
      views: 189,
      saves: 8,
    },
    {
      id: 3,
      title: 'HOA Community Bin Maintenance',
      subtitle: 'Hybrid, 15,000 miles, excellent condition',
      category: 'Vehicles',
      status: 'Draft',
      dateAdded: 'Mar 12, 2023',
      image: '/FRAME-2.png',
      views: 0,
      saves: 0,
    },
    {
      id: 4,
      title: 'Weekly Residential Trash Can Cleaning',
      subtitle: 'Established business, prime location',
      category: 'Business',
      status: 'Review',
      dateAdded: 'Apr 5, 2023',
      image: '/FRAME-3.png',
      views: 156,
      saves: 23,
    },
    {
      id: 5,
      title: 'Commercial Dumpster Deep Clean',
      subtitle: '1,200 sq ft, high foot traffic',
      category: 'Commercial',
      status: 'Active',
      dateAdded: 'May 22, 2023',
      image: '/FRAME-4.png',
      views: 298,
      saves: 19,
    },
  ];

  const savedListings = [
    {
      id: 101,
      title: 'Modern Apartment in Downtown',
      subtitle: '2 bed, 2 bath, fully furnished',
      category: 'Business',
      dateAdded: 'Jan 15, 2023',
      image: '/FRAME-5.png',
    },
    {
      id: 102,
      title: 'MacBook Pro 16" 2023',
      subtitle: 'M2 Max, 32GB RAM, 1TB SSD',
      category: 'Equipment',
      dateAdded: 'Feb 3, 2023',
      image: '/Professional-grade cleaning equipment.png',
    },
    {
      id: 103,
      title: 'Toyota Camry 2022',
      subtitle: 'Hybrid, 15,000 miles, excellent condition',
      category: 'Vehicles',
      dateAdded: 'Mar 12, 2023',
      image: '/Cleaning Biz.png',
    },
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'expired':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };


  const activeListings = listings.filter((l) => l.status === 'Active').length;
  const draftListings = listings.filter((l) => l.status === 'Draft').length;

  return (
    <DashboardLayout 
      title="Your Dashboard"
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
                        {statsLoading ? '...' : (dashboardStats?.total_listings || 0)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className='text-gray-500 text-sm font-normal font-sans mb-4'>
                  Total active and draft listings
                </p>
                <div className='flex justify-between text-sm'>
                  <div>
                    <span className='text-gray-500'>Active</span>
                    <div className='text-2xl font-semibold text-gray-900'>
                      {statsLoading ? (
                        <div className="w-6 h-6 border-2 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
                      ) : (
                        dashboardStats?.active_listings || 0
                      )}
                    </div>
                  </div>
                  <div>
                    <span className='text-gray-500'>Draft</span>
                    <div className='text-2xl font-semibold text-gray-900'>
                      {statsLoading ? (
                        <div className="w-6 h-6 border-2 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
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
                  <span className='bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full'>
                    Complete
                  </span>
                </div>
                <p className='text-gray-500 text-sm font-normal font-sans mb-4'>
                  Your account verification progress
                </p>

                {/* Progress Bar */}
                <div className='w-full bg-gray-200 rounded-full h-1 mb-4'>
                  <div className='bg-green-600 h-1 rounded-full w-full'></div>
                </div>

                {/* Verification Items */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='w-4 h-4 text-green-600' />
                    <span className='text-sm text-gray-700'>Email</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='w-4 h-4 text-green-600' />
                    <span className='text-sm text-gray-700'>Phone</span>
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
            <div className='bg-white rounded-xl border border-gray-200'>
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
                    <option value='all'>Status</option>
                    <option value='active'>Active</option>
                    <option value='draft'>Draft</option>
                    <option value='review'>Review</option>
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
                    {listings.map((listing) => (
                      <tr
                        key={listing.id}
                        className='hover:bg-gray-50 transition-colors'
                      >
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3'>
                            <div className='w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0'>
                              <Image
                                src={listing.image}
                                alt={listing.title}
                                width={48}
                                height={48}
                                className='w-full h-full object-cover'
                              />
                            </div>
                            <div className='min-w-0'>
                              <h4 className='text-gray-900 text-sm font-medium font-sans truncate'>
                                {listing.title}
                              </h4>
                              <p className='text-gray-500 text-xs font-normal font-sans truncate'>
                                {listing.subtitle}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <span className='inline-flex items-center gap-1 text-sm'>
                            <span className='text-lg'>
                              {getCategoryIcon(listing.category)}
                            </span>
                            <span className='text-gray-700 font-normal font-sans'>
                              {listing.category}
                            </span>
                          </span>
                        </td>
                        <td className='px-6 py-4'>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                              listing.status
                            )}`}
                          >
                            {listing.status}
                          </span>
                        </td>
                        <td className='px-6 py-4'>
                          <span className='text-gray-500 text-sm font-normal font-sans'>
                            {listing.dateAdded}
                          </span>
                        </td>
                        <td className='px-6 py-4 text-right'>
                          <div className='flex items-center justify-end gap-2'>
                            <button className='p-1 text-gray-400 hover:text-gray-600 transition-colors'>
                              <Edit className='w-4 h-4' />
                            </button>
                            <button className='p-1 text-gray-400 hover:text-red-600 transition-colors'>
                              <Trash2 className='w-4 h-4' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
                <p className='text-sm text-gray-500'>
                  Showing 1-5 of 12 entries
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
                  Clear All
                </button>
              </div>

              {/* Saved Listings Grid */}
              <div className='p-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  {savedListings.map((listing) => (
                    <div
                      key={listing.id}
                      className='border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0'>
                          <Image
                            src={listing.image}
                            alt={listing.title}
                            width={48}
                            height={48}
                            className='w-full h-full object-cover'
                          />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <h4 className='text-gray-900 text-sm font-medium font-sans truncate'>
                            {listing.title}
                          </h4>
                          <p className='text-gray-500 text-xs font-normal font-sans truncate'>
                            {listing.subtitle}
                          </p>
                        </div>
                        <button className='p-1 text-red-400 hover:text-red-600 transition-colors'>
                          <Heart className='w-4 h-4 fill-current' />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Saved Listings Pagination */}
                <div className='flex items-center justify-between mt-6'>
                  <p className='text-sm text-gray-500'>
                    Showing 1-3 of 12 entries
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
                    Track and manage inquiries about your listings. Respond
                    faster and close more deals.
                  </p>
                  <button className='bg-gray-100 text-gray-500 text-sm font-medium px-4 py-2 rounded-lg cursor-not-allowed'>
                    Available in Premium Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
    </DashboardLayout>
  );
}

function getCategoryIcon(category) {
  const icons = {
    Business: '🏢',
    Equipment: '🔧',
    Vehicles: '🚗',
    Commercial: '🏪',
  };
  return icons[category] || '📦';
}
