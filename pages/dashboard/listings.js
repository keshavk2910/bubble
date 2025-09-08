import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useOptionalUserSession } from '../../lib/useUserSession';
import {
  Search,
  Bell,
  Download,
  MoreHorizontal,
  Users,
  FileText,
  BarChart3,
  Settings,
  Star,
  Tag,
  User,
  LogOut,
  Home,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import ListingsTable from '../../components/ListingsTable';

export default function AdminListings() {
  const { user: sessionUser, avatar: sessionAvatar } = useOptionalUserSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeatured, setShowFeatured] = useState(false);

  // Admin user data with session
  const adminUser = {
    name: sessionUser?.display_name || sessionUser?.full_name || 'Admin User',
    avatar: sessionAvatar || '/api/placeholder/40/40',
    initials:
      sessionUser?.full_name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() || 'AD',
    role: 'Super Admin',
  };

  // Mock listings data
  const allListings = [
    {
      id: 'L-1001',
      title: 'Residential Driveway Cleaning',
      category: 'Residential',
      user: 'John Smith',
      date: '2023-11-15',
      status: 'Active',
    },
    {
      id: 'L-1002',
      title: 'Commercial Building Exterior',
      category: 'Commercial',
      user: 'Sarah Johnson',
      date: '2023-11-14',
      status: 'Pending',
    },
    {
      id: 'L-1003',
      title: 'Deck & Patio Restoration',
      category: 'Residential',
      user: 'Mike Williams',
      date: '2023-11-13',
      status: 'Sponsored',
    },
    {
      id: 'L-1004',
      title: 'Parking Lot Cleaning Service',
      category: 'Commercial',
      user: 'Emily Davis',
      date: '2023-11-12',
      status: 'Active',
    },
    {
      id: 'L-1005',
      title: 'Roof Cleaning Special',
      category: 'Residential',
      user: 'Robert Brown',
      date: '2023-11-11',
      status: 'Bubble Binz',
    },
    {
      id: 'L-1006',
      title: 'Graffiti Removal Service',
      category: 'Commercial',
      user: 'Lisa Wilson',
      date: '2023-11-10',
      status: 'Active',
    },
    {
      id: 'L-1007',
      title: 'Fence Cleaning & Restoration',
      category: 'Residential',
      user: 'David Miller',
      date: '2023-11-09',
      status: 'Pending',
    },
    {
      id: 'L-1008',
      title: 'Restaurant Exterior Cleaning',
      category: 'Commercial',
      user: 'Jennifer Taylor',
      date: '2023-11-08',
      status: 'Sponsored',
    },
  ];

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => {
      setListings(allListings);
      setIsLoading(false);
    }, 1000);
  }, [allListings]);

  const filterButtons = [
    { key: 'All', label: 'All', count: allListings.length },
    {
      key: 'Active',
      label: 'Active',
      count: allListings.filter((l) => l.status === 'Active').length,
    },
    {
      key: 'Pending',
      label: 'Pending',
      count: allListings.filter((l) => l.status === 'Pending').length,
    },
    {
      key: 'Sponsored',
      label: 'Sponsored',
      count: allListings.filter((l) => l.status === 'Sponsored').length,
    },
    {
      key: 'Bubble Binz',
      label: 'Bubble Binz',
      count: allListings.filter((l) => l.status === 'Bubble Binz').length,
    },
  ];

  const filteredListings =
    statusFilter === 'All'
      ? allListings
      : allListings.filter((listing) => listing.status === statusFilter);

  const handleEdit = (listing) => {
    console.log('Edit listing:', listing);
  };

  const handleDelete = (listing) => {
    console.log('Delete listing:', listing);
  };

  const handleView = (listing) => {
    console.log('View listing:', listing);
  };

  const handleToggleFeatured = async (listing) => {
    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const response = await fetch(
        `/api/admin/listings/${listing.id}/featured`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ featured: !listing.featured }),
        }
      );

      if (response.ok) {
        // Update local state
        setListings((prev) =>
          prev.map((l) =>
            l.id === listing.id ? { ...l, featured: !l.featured } : l
          )
        );
      }
    } catch (error) {
      console.error('Toggle featured error:', error);
    }
  };

  const handleExport = () => {
    console.log('Exporting listings...');
  };

  const handleBulkAction = (action, selectedIds) => {
    console.log(`Bulk ${action} for listings:`, selectedIds);
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
          <Link
            href='/dashboard/admin'
            className='flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors text-green-100 hover:bg-green-700 hover:text-white'
          >
            <Home className='w-5 h-5' />
            <span className='font-sans'>Dashboard</span>
          </Link>

          <div className='flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left bg-green-700 text-white'>
            <FileText className='w-5 h-5' />
            <span className='font-sans'>Listings</span>
          </div>

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
                {adminUser.initials}
              </span>
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-white text-sm font-medium truncate'>
                {adminUser.name}
              </p>
              <p className='text-green-200 text-xs truncate'>
                {adminUser.role}
              </p>
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
              Listings Center
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
            <div className='grid grid-cols-1 xl:grid-cols-4 gap-6'>
              {/* Listings Section */}
              <div className='xl:col-span-3'>
                <div className='bg-white rounded-lg border border-gray-200'>
                  {/* Listings Header with Filters */}
                  <div className='px-6 py-6'>
                    <div className='flex items-center justify-between mb-6'>
                      <div className='flex items-center gap-4'>
                        <h2 className='text-gray-700 text-lg font-normal font-sans leading-7'>
                          Listings
                        </h2>

                        {/* Featured Filter Button */}
                        <button
                          onClick={() => setShowFeatured(!showFeatured)}
                          className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-normal font-sans transition-colors ${
                            showFeatured
                              ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              showFeatured ? 'fill-current' : ''
                            }`}
                          />
                          {showFeatured ? 'All Listings' : 'Featured Only'}
                        </button>
                      </div>

                      {/* Bulk Actions */}
                      <div className='flex items-center gap-3'>
                        <button className='flex items-center gap-2 px-3 py-2 text-gray-600 text-sm hover:bg-gray-50 rounded transition-colors'>
                          <input
                            type='checkbox'
                            className='rounded border-gray-300'
                          />
                          <span>Select All</span>
                        </button>
                        <button className='flex items-center gap-2 px-3 py-2 text-gray-600 text-sm hover:bg-gray-50 rounded transition-colors'>
                          <Edit className='w-4 h-4' />
                          <span>Edit</span>
                        </button>
                        <button className='flex items-center gap-2 px-3 py-2 text-gray-600 text-sm hover:bg-gray-50 rounded transition-colors'>
                          <Trash2 className='w-4 h-4' />
                          <span>Remove</span>
                        </button>
                        <button className='flex items-center gap-2 px-3 py-2 text-gray-600 text-sm hover:bg-gray-50 rounded transition-colors'>
                          <Star className='w-4 h-4' />
                          <span>Feature</span>
                        </button>
                        <button className='flex items-center gap-2 px-3 py-2 text-gray-600 text-sm hover:bg-gray-50 rounded transition-colors'>
                          <Tag className='w-4 h-4' />
                          <span>Tag</span>
                        </button>
                      </div>
                    </div>

                    {/* Status Filter Buttons */}
                    <div className='flex items-center gap-2 mb-6'>
                      <span className='text-gray-500 text-sm font-normal font-sans leading-tight mr-2'>
                        Filter by:
                      </span>
                      {filterButtons.map((filter) => (
                        <button
                          key={filter.key}
                          onClick={() => setStatusFilter(filter.key)}
                          className={`px-3 py-1 rounded text-sm font-normal font-sans leading-tight transition-colors ${
                            statusFilter === filter.key
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Listings Table */}
                  <ListingsTable
                    listings={
                      showFeatured
                        ? filteredListings.filter((l) => l.featured)
                        : filteredListings
                    }
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    onToggleFeatured={handleToggleFeatured}
                  />
                </div>
              </div>

              {/* Right Sidebar - Analytics (Same as admin dashboard) */}
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
                        1,245
                      </span>
                    </div>

                    <div className='flex justify-between items-center'>
                      <div>
                        <div className='text-gray-600 text-sm'>
                          Active Today
                        </div>
                        <div className='text-gray-600 text-sm'>
                          New This Month
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='text-gray-900 text-lg font-semibold'>
                          389
                        </div>
                        <div className='text-gray-900 text-lg font-semibold'>
                          42
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

                  <div className='h-32 bg-gradient-to-t from-green-100 to-green-50 rounded-lg flex items-end justify-center p-4'>
                    <div className='text-center'>
                      <div className='w-full h-20 bg-green-200 rounded-t-lg mb-2 relative overflow-hidden'>
                        <div className='absolute bottom-0 w-full h-16 bg-green-400 rounded-t-lg'></div>
                      </div>
                      <span className='text-gray-600 text-xs'>
                        Chart placeholder
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Activity Chart */}
                <div className='bg-white rounded-lg border border-gray-200 p-6'>
                  <h3 className='text-gray-900 text-lg font-semibold font-sans mb-4'>
                    User Activity
                  </h3>

                  <div className='h-24 bg-gray-50 rounded-lg flex items-end justify-between p-2'>
                    {[40, 65, 45, 70, 55, 80, 35].map((height, index) => (
                      <div
                        key={index}
                        className='bg-green-500 rounded-t'
                        style={{ height: `${height}%`, width: '12px' }}
                      ></div>
                    ))}
                  </div>
                  <div className='flex justify-between mt-2 text-xs text-gray-500'>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>

                {/* User Types Pie Chart */}
                <div className='bg-white rounded-lg border border-gray-200 p-6'>
                  <h3 className='text-gray-900 text-lg font-semibold font-sans mb-4'>
                    User Types
                  </h3>

                  <div className='relative w-24 h-24 mx-auto mb-4'>
                    <div className='w-24 h-24 rounded-full bg-green-500 relative overflow-hidden'>
                      <div className='absolute top-0 left-1/2 w-12 h-12 bg-blue-500 rounded-bl-full'></div>
                      <div className='absolute bottom-0 right-0 w-6 h-6 bg-purple-500 rounded-tl-full'></div>
                    </div>
                  </div>

                  <div className='space-y-2 text-sm'>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                      <span className='text-gray-700 text-xs font-normal font-sans'>
                        Service Providers
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
                      <span className='text-gray-700 text-xs font-normal font-sans'>
                        Customers
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 bg-purple-500 rounded-full'></div>
                      <span className='text-gray-700 text-xs font-normal font-sans'>
                        Both
                      </span>
                    </div>
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
