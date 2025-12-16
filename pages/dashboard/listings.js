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
  const [selectedListings, setSelectedListings] = useState([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const [bulkActionMessage, setBulkActionMessage] = useState('');

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
      key: 'bins_buy_sell',
      label: 'Bins Buy Sell',
      count: listings.filter((l) => l.status === 'bins_buy_sell').length,
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

  // const handleExport = () => {
  //   console.log('Exporting listings...');
  // };

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

  // Bulk Actions
  const handleSelectAll = () => {
    if (selectedListings.length === filteredListings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(filteredListings.map(l => l.id));
    }
  };

  const handleToggleSelect = (listingId) => {
    setSelectedListings(prev =>
      prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const handleBulkRemove = async () => {
    if (selectedListings.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedListings.length} listing(s)?`)) {
      return;
    }

    setIsBulkActionLoading(true);
    setBulkActionMessage(`Deleting ${selectedListings.length} listing(s)...`);

    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      for (const listingId of selectedListings) {
        await fetch(`/api/listings?listingId=${listingId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      // Reload listings
      setListings(prev => prev.filter(l => !selectedListings.includes(l.id)));
      setSelectedListings([]);
    } catch (error) {
      console.error('Bulk remove error:', error);
      alert('Error deleting listings. Please try again.');
    } finally {
      setIsBulkActionLoading(false);
      setBulkActionMessage('');
    }
  };

  const handleBulkFeature = async () => {
    if (selectedListings.length === 0) return;

    // Only feature listings that are NOT already featured
    const listingsToFeature = selectedListings.filter(id => {
      const listing = listings.find(l => l.id === id);
      return listing && !listing.featured;
    });

    if (listingsToFeature.length === 0) {
      alert('All selected listings are already featured.');
      return;
    }

    setIsBulkActionLoading(true);
    setBulkActionMessage(`Featuring ${listingsToFeature.length} listing(s)...`);

    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      for (const listingId of listingsToFeature) {
        await fetch(`/api/admin/listings/${listingId}/featured`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ featured: true }),
        });
      }

      // Update local state
      setListings(prev =>
        prev.map(l =>
          listingsToFeature.includes(l.id) ? { ...l, featured: true } : l
        )
      );
      setSelectedListings([]);
    } catch (error) {
      console.error('Bulk feature error:', error);
      alert('Error featuring listings. Please try again.');
    } finally {
      setIsBulkActionLoading(false);
      setBulkActionMessage('');
    }
  };

  const handleBulkUnfeature = async () => {
    if (selectedListings.length === 0) return;

    // Only unfeature listings that ARE featured
    const listingsToUnfeature = selectedListings.filter(id => {
      const listing = listings.find(l => l.id === id);
      return listing && listing.featured;
    });

    if (listingsToUnfeature.length === 0) {
      alert('No featured listings selected to unfeature.');
      return;
    }

    setIsBulkActionLoading(true);
    setBulkActionMessage(`Unfeaturing ${listingsToUnfeature.length} listing(s)...`);

    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      for (const listingId of listingsToUnfeature) {
        await fetch(`/api/admin/listings/${listingId}/featured`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ featured: false }),
        });
      }

      // Update local state
      setListings(prev =>
        prev.map(l =>
          listingsToUnfeature.includes(l.id) ? { ...l, featured: false } : l
        )
      );
      setSelectedListings([]);
    } catch (error) {
      console.error('Bulk unfeature error:', error);
      alert('Error unfeaturing listings. Please try again.');
    } finally {
      setIsBulkActionLoading(false);
      setBulkActionMessage('');
    }
  };

  // const handleBulkTag = () => {
  //   if (selectedListings.length === 0) return;
  //   alert('Tag functionality coming soon!');
  // };

  return (
    <>
      <Head>
        <title>Listings Center - Bins Buy Sell</title>
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
        // onExport={handleExport}
        analytics={{}}
        isLoading={false}
      >
        {/* Listings Management */}
        <div className='bg-white rounded-lg border border-gray-200'>
          <div className='px-4 lg:px-6 py-4 lg:py-6'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 lg:mb-6'>
              <div className='flex items-center gap-2 lg:gap-4'>
                <h2 className='text-gray-700 text-base lg:text-lg font-normal font-sans leading-7'>
                  Listings
                </h2>

                {/* Featured Filter Button */}
                <button
                  onClick={() => setShowFeatured(!showFeatured)}
                  className={`flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1 lg:py-2 rounded text-xs lg:text-sm font-normal font-sans transition-colors ${
                    showFeatured
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Star
                    className={`w-3 lg:w-4 h-3 lg:h-4 ${showFeatured ? 'fill-current' : ''}`}
                  />
                  <span className="hidden sm:inline">{showFeatured ? 'All Listings' : 'Featured'}</span>
                </button>

                <button
                  onClick={() => setShowDeleted(!showDeleted)}
                  className={`flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1 lg:py-2 rounded text-xs lg:text-sm font-normal font-sans transition-colors ${
                    showDeleted
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Trash2 className={`w-3 lg:w-4 h-3 lg:h-4`} />
                  <span className="hidden sm:inline">{showDeleted ? 'All Listings' : 'Trash'}</span>
                </button>
              </div>

              {/* Bulk Actions */}
              <div className='flex flex-wrap items-center gap-2 lg:gap-3'>
                <button
                  onClick={handleSelectAll}
                  disabled={isBulkActionLoading}
                  className='flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-2 text-gray-600 text-xs lg:text-sm hover:bg-gray-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <input
                    type='checkbox'
                    className='rounded border-gray-300'
                    checked={selectedListings.length === filteredListings.length && filteredListings.length > 0}
                    onChange={handleSelectAll}
                    onClick={(e) => e.stopPropagation()}
                    disabled={isBulkActionLoading}
                  />
                  <span className="hidden sm:inline">Select All</span>
                  <span className="sm:hidden">All</span>
                  <span>({selectedListings.length})</span>
                </button>
                {/* Removed Edit button */}
                <button
                  onClick={handleBulkRemove}
                  disabled={selectedListings.length === 0 || isBulkActionLoading}
                  className='flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-2 text-gray-600 text-xs lg:text-sm hover:bg-gray-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Trash2 className='w-3 lg:w-4 h-3 lg:h-4' />
                  <span className="hidden sm:inline">Remove</span>
                </button>
                <button
                  onClick={handleBulkFeature}
                  disabled={selectedListings.length === 0 || isBulkActionLoading}
                  className='flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-2 text-gray-600 text-xs lg:text-sm hover:bg-gray-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Star className='w-3 lg:w-4 h-3 lg:h-4' />
                  <span className="hidden sm:inline">Feature</span>
                </button>
                <button
                  onClick={handleBulkUnfeature}
                  disabled={selectedListings.length === 0 || isBulkActionLoading}
                  className='flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-2 text-gray-600 text-xs lg:text-sm hover:bg-gray-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Star className='w-3 lg:w-4 h-3 lg:h-4 fill-gray-400' />
                  <span className="hidden sm:inline">Unfeature</span>
                </button>
                {/* Tag button - commented out for now */}
                {/* <button
                  onClick={handleBulkTag}
                  disabled={selectedListings.length === 0 || isBulkActionLoading}
                  className='flex items-center gap-2 px-3 py-2 text-gray-600 text-sm hover:bg-gray-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Tag className='w-4 h-4' />
                  <span>Tag</span>
                </button> */}
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
            selectedListings={selectedListings}
            onToggleSelect={handleToggleSelect}
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

        {/* Bulk Action Loading Overlay */}
        {isBulkActionLoading && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-xl p-8 shadow-2xl max-w-md w-full mx-4'>
              <div className='flex flex-col items-center gap-4'>
                <div className='w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin'></div>
                <div className='text-center'>
                  <h3 className='text-gray-900 text-lg font-semibold font-sans mb-2'>
                    Processing...
                  </h3>
                  <p className='text-gray-600 text-base font-normal font-sans'>
                    {bulkActionMessage}
                  </p>
                  <p className='text-gray-500 text-sm font-normal font-sans mt-2'>
                    Please wait, do not close this page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
