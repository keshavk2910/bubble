import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Star, Tag, Edit, Trash2 } from 'lucide-react';
import { useOptionalUserSession } from '../../lib/useUserSession';
import AdminLayout from '../../components/AdminLayout';
import ListingsTable from '../../components/ListingsTable';
import ListingEditModal from '../../components/ListingEditModal';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function AdminListings() {
  const router = useRouter();
  const { user: sessionUser } = useOptionalUserSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeatured, setShowFeatured] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState(null);

  // Load real listings data from database
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const session = localStorage.getItem('supabase_session');
        if (!session) {
          router.push('/sign-in?redirect=/dashboard/listings');
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
          router.push('/sign-in?redirect=/dashboard/listings');
          return;
        }

        const userData = await userResponse.json();
        if (userData.profile?.role !== 'admin') {
          router.replace('/dashboard/user');
          return;
        }

        setUserProfile(userData.profile);

        // Load listings with filters
        const params = new URLSearchParams();
        params.append('limit', '100');
        params.append('include_deleted', 'true');
        if (searchTerm) params.append('search', searchTerm);
        
        const listingsResponse = await fetch(
          `/api/admin/listings?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (listingsResponse.ok) {
          const listingsData = await listingsResponse.json();
          setListings(listingsData.listings);
        }
      } catch (error) {
        console.error('Admin listings loading error:', error);
        router.push('/sign-in?redirect=/dashboard/listings');
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, [router, searchTerm]);

  // Calculate filter buttons based on real data
  const filterButtons = [
    {
      key: 'All',
      label: 'All',
      count: listings.filter((l) => l.status !== 'deleted').length,
    },
    {
      key: 'active',
      label: 'Active',
      count: listings.filter((l) => l.status === 'active').length,
    },
    {
      key: 'pending',
      label: 'Pending',
      count: listings.filter((l) => l.status === 'pending').length,
    },
    {
      key: 'sponsored',
      label: 'Sponsored',
      count: listings.filter((l) => l.status === 'sponsored').length,
    },
    {
      key: 'bubble_binz',
      label: 'Bubble Binz',
      count: listings.filter((l) => l.status === 'bubble_binz').length,
    },
  ];

  const filteredListings =
    statusFilter === 'All'
      ? listings.filter((l) => l.status !== 'deleted')
      : listings.filter((listing) => listing.status === statusFilter);

  // Handler functions
  const handleEdit = (listing) => {
    setSelectedListing(listing);
    setShowEditModal(true);
  };

  const handleListingUpdated = (updatedListing) => {
    setListings(prev => prev.map(listing => 
      listing.id === updatedListing.id ? { ...updatedListing, ...listing } : listing
    ));
  };

  const handleDelete = (listing) => {
    console.log('Delete listing:', listing);
  };

  const handleView = (listing) => {
    window.open(`/listing/${listing.slug || listing.id}`, '_blank');
  };

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

  const handleRecover = (listing) => {
    handleStatusChange(listing.id, 'active');
  };

  // Load admin data
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const session = localStorage.getItem('supabase_session');
        if (!session) {
          router.push('/sign-in?redirect=/dashboard/listings');
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
          router.push('/sign-in?redirect=/dashboard/listings');
          return;
        }

        const userData = await userResponse.json();
        if (userData.profile?.role !== 'admin') {
          router.replace('/dashboard/user');
          return;
        }

        setUserProfile(userData.profile);

        // Load listings and users in parallel
        const [listingsResponse] = await Promise.all([
          fetch('/api/admin/listings?limit=100&include_deleted=true', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

        if (listingsResponse.ok) {
          const listingsData = await listingsResponse.json();
          setListings(listingsData.listings);
        }
      } catch (error) {
        console.error('Admin listings loading error:', error);
        router.push('/sign-in?redirect=/dashboard/listings');
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, [router]);

  // Handler functions for ListingsTable

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex'>
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <div className='w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    console.log('Exporting listings...');
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

  return (
    <>
      <Head>
        <title>Listings Center - Bin Cleaning Classifieds</title>
        <meta
          name='description'
          content='Manage all marketplace listings with admin controls, featuring, and status management.'
        />
      </Head>

      <AdminLayout
        currentPage='listings'
        title='Listings Center'
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onExport={handleExport}
        analytics={{}}
        isLoading={false}
      >
        {/* Listings Management */}
        <div className='bg-white rounded-lg border border-gray-200'>
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
                    className={`w-4 h-4 ${showFeatured ? 'fill-current' : ''}`}
                  />
                  {showFeatured ? 'All Listings' : 'Featured Only'}
                </button>

                <button
                  onClick={() => setShowDeleted(!showDeleted)}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-normal font-sans transition-colors ${
                    showDeleted
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Trash2 className={`w-4 h-4`} />
                  {showDeleted ? 'All Listings' : 'Trash'}
                </button>
              </div>

              {/* Bulk Actions */}
              <div className='flex items-center gap-3'>
                <button className='flex items-center gap-2 px-3 py-2 text-gray-600 text-sm hover:bg-gray-50 rounded transition-colors'>
                  <input type='checkbox' className='rounded border-gray-300' />
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
              showDeleted
                ? listings.filter((l) => l.status === 'deleted')
                : showFeatured
                ? listings.filter(
                    (l) => l.featured === true && l.status !== 'deleted'
                  )
                : filteredListings
            }
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onStatusChange={handleStatusChange}
            onApprove={handleApprove}
            onReject={handleReject}
            onRecover={handleRecover}
            onToggleFeatured={handleToggleFeatured}
          />
        </div>

        {/* Listing Edit Modal */}
        <ListingEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedListing(null);
          }}
          listing={selectedListing}
          onListingUpdated={handleListingUpdated}
        />
      </AdminLayout>
    </>
  );
}
