import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Star, Trash2 } from 'lucide-react';
import { useOptionalUserSession } from '../../lib/useUserSession';
import AdminLayout from '../../components/AdminLayout';
import ListingsTable from '../../components/ListingsTable';
import UsersTable from '../../components/UsersTable';

export default function AdminDashboard() {
  const router = useRouter();
  const { user: sessionUser, avatar: sessionAvatar } = useOptionalUserSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminStats, setAdminStats] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [showFeatured, setShowFeatured] = useState(false);

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
    <>
      <Head>
        <title>Admin Dashboard - Bin Cleaning Classifieds</title>
        <meta
          name='description'
          content='Admin control center for managing listings, users, and marketplace analytics.'
        />
      </Head>
      <AdminLayout
        currentPage='admin'
        title='Admin Control Center'
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onExport={handleExport}
        analytics={analytics}
        isLoading={isLoading}
      >
        <div className='space-y-6'>
          {/* Listings Management */}
          <div className='bg-white rounded-lg border border-gray-200'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <h2 className='text-gray-900 text-lg font-semibold font-sans'>
                  Listings Management
                </h2>
                <div className='flex items-center gap-3'>
                  <button
                    onClick={() => setShowFeatured(!showFeatured)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      showFeatured
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        showFeatured ? 'fill-current' : ''
                      }`}
                    />
                    {showFeatured ? 'Show All Listings' : 'Featured'}
                  </button>
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
            </div>
            <ListingsTable
              listings={
                showDeleted
                  ? listings.filter((l) => l.status === 'deleted')
                  : showFeatured
                  ? listings.filter(
                      (l) => l.featured === true && l.status !== 'deleted'
                    )
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
              onToggleFeatured={handleToggleFeatured}
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
      </AdminLayout>
    </>
  );
}
