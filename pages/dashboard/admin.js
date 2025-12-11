import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Star, Trash2, Shield } from 'lucide-react';
import { useOptionalUserSession } from '../../lib/useUserSession';
import AdminLayout from '../../components/AdminLayout';
import ListingsTable from '../../components/ListingsTable';
import UsersTable from '../../components/UsersTable';
import ReportsTable from '../../components/ReportsTable';
import ListingEditModal from '../../components/ListingEditModal';
import UserEditModal from '../../components/UserEditModal';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function AdminDashboard() {
  const router = useRouter();
  const { user: sessionUser, avatar: sessionAvatar } = useOptionalUserSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [adminStats, setAdminStats] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [showFeatured, setShowFeatured] = useState(false);
  
  // Modal states
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showListingEditModal, setShowListingEditModal] = useState(false);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [showUserBlockModal, setShowUserBlockModal] = useState(false);
  const [userToBlock, setUserToBlock] = useState(null);
  const [isBlocking, setIsBlocking] = useState(false);

  // Bulk actions state
  const [selectedListings, setSelectedListings] = useState([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const [bulkActionMessage, setBulkActionMessage] = useState('');

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

        // Load admin stats, listings, users, reports, and analytics in parallel
        const [
          statsResponse,
          listingsResponse,
          usersResponse,
          reportsResponse,
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
          fetch('/api/admin/reports?limit=10&status=pending', {
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

        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          setReports(reportsData.reports || []);
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
    setSelectedListing(listing);
    setShowListingEditModal(true);
  };

  const handleListingUpdated = (updatedListing) => {
    setListings(prev => prev.map(listing => 
      listing.id === updatedListing.id ? { ...updatedListing, ...listing } : listing
    ));
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

  // User management handlers
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserEditModal(true);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers(prev => prev.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    ));
  };

  const handleBlockUser = (user) => {
    setUserToBlock(user);
    setShowUserBlockModal(true);
  };

  const confirmBlockUser = async () => {
    if (!userToBlock) return;

    setIsBlocking(true);
    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const newStatus = userToBlock.status === 'blocked' ? 'active' : 'blocked';
      
      const response = await fetch(`/api/admin/users/${userToBlock.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setUsers(prev => prev.map(u => 
          u.id === userToBlock.id 
            ? { ...u, status: newStatus }
            : u
        ));
        setShowUserBlockModal(false);
        setUserToBlock(null);
      } else {
        const errorData = await response.json();
        console.error('Block user error:', errorData);
      }
    } catch (error) {
      console.error('Block user error:', error);
    } finally {
      setIsBlocking(false);
    }
  };

  const handleViewUser = (user) => {
    console.log('View user:', user);
  };

  // const handleExport = () => {
  //   console.log('Exporting data...');
  //   // Handle export functionality
  // };

  // Bulk Actions for Listings
  const currentListings = showDeleted
    ? listings.filter((l) => l.status === 'deleted')
    : showFeatured
    ? listings.filter((l) => l.featured === true && l.status !== 'deleted')
    : listings.filter((l) => l.status !== 'deleted');

  const handleSelectAll = () => {
    if (selectedListings.length === currentListings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(currentListings.map(l => l.id));
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

  return (
    <>
      <Head>
        <title>Admin Dashboard - Bins Buy Sell</title>
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
        // onExport={handleExport}
        analytics={analytics}
        isLoading={isLoading}
      >
        <div className='space-y-6'>
          {/* Listings Management */}
          <div className='bg-white rounded-lg border border-gray-200'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <div className='flex items-center justify-between mb-4'>
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

              {/* Bulk Actions */}
              <div className='flex items-center gap-3'>
                <button
                  onClick={handleSelectAll}
                  disabled={isBulkActionLoading}
                  className='flex items-center gap-2 px-3 py-2 text-gray-600 text-sm hover:bg-gray-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <input
                    type='checkbox'
                    className='rounded border-gray-300'
                    checked={selectedListings.length === currentListings.length && currentListings.length > 0}
                    onChange={handleSelectAll}
                    onClick={(e) => e.stopPropagation()}
                    disabled={isBulkActionLoading}
                  />
                  <span>Select All ({selectedListings.length})</span>
                </button>
                <button
                  onClick={handleBulkRemove}
                  disabled={selectedListings.length === 0 || isBulkActionLoading}
                  className='flex items-center gap-2 px-3 py-2 text-gray-600 text-sm hover:bg-gray-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Trash2 className='w-4 h-4' />
                  <span>Remove</span>
                </button>
                <button
                  onClick={handleBulkFeature}
                  disabled={selectedListings.length === 0 || isBulkActionLoading}
                  className='flex items-center gap-2 px-3 py-2 text-gray-600 text-sm hover:bg-gray-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Star className='w-4 h-4' />
                  <span>Feature</span>
                </button>
                <button
                  onClick={handleBulkUnfeature}
                  disabled={selectedListings.length === 0 || isBulkActionLoading}
                  className='flex items-center gap-2 px-3 py-2 text-gray-600 text-sm hover:bg-gray-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Star className='w-4 h-4 fill-gray-400' />
                  <span>Unfeature</span>
                </button>
              </div>
            </div>
            <ListingsTable
              listings={currentListings}
              isLoading={isLoading}
              onEdit={handleEditListing}
              onDelete={handleDeleteListing}
              onView={handleViewListing}
              onStatusChange={handleStatusChange}
              onApprove={handleApprove}
              onReject={handleReject}
              onRecover={handleRecoverListing}
              onToggleFeatured={handleToggleFeatured}
              selectedListings={selectedListings}
              onToggleSelect={handleToggleSelect}
            />
          </div>

          {/* Users Management */}
          <div className='bg-white rounded-lg border border-gray-200'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <h2 className='text-gray-900 text-lg font-semibold font-sans'>
                  Users Management
                </h2>
                <button
                  onClick={() => router.push('/dashboard/users')}
                  className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors'
                >
                  <Shield className='w-4 h-4' />
                  <span>View All Users</span>
                </button>
              </div>
            </div>
            <UsersTable
              users={users}
              isLoading={isLoading}
              onEdit={handleEditUser}
              onBlock={handleBlockUser}
              onView={handleViewUser}
              hideCheckboxes={true}
            />
          </div>

          {/* Reports Management */}
          <div className='bg-white rounded-lg border border-gray-200'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <div className="flex items-center justify-between">
                <h2 className='text-gray-900 text-lg font-semibold font-sans'>
                  Content Reports
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4 text-red-500" />
                  <span>{reports.filter(r => r.status === 'pending').length} pending review</span>
                </div>
              </div>
            </div>
            <ReportsTable
              reports={reports.slice(0, 5)} // Show only first 5 on dashboard
              isLoading={isLoading}
              onViewListing={(listing) => window.open(`/listing/${listing.slug || listing.id}`, '_blank')}
              onViewReporter={(report) => console.log('View reporter:', report)}
              onResolve={(report) => console.log('Resolve report:', report)}
              onDismiss={(report) => console.log('Dismiss report:', report)}
              onChangeListingStatus={handleStatusChange}
            />
            {reports.length > 5 && (
              <div className="px-6 py-3 border-t border-gray-200 text-center">
                <button
                  onClick={() => router.push('/dashboard/reports')}
                  className="text-green-600 text-sm font-medium hover:text-green-700 transition-colors"
                >
                  View All Reports ({reports.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Listing Edit Modal */}
        <ListingEditModal
          isOpen={showListingEditModal}
          onClose={() => {
            setShowListingEditModal(false);
            setSelectedListing(null);
          }}
          listing={selectedListing}
          onListingUpdated={handleListingUpdated}
        />

        {/* User Edit Modal */}
        <UserEditModal
          isOpen={showUserEditModal}
          onClose={() => {
            setShowUserEditModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onUserUpdated={handleUserUpdated}
        />

        {/* User Block/Unblock Confirmation Modal */}
        <ConfirmationModal
          isOpen={showUserBlockModal}
          onClose={() => {
            setShowUserBlockModal(false);
            setUserToBlock(null);
          }}
          onConfirm={confirmBlockUser}
          title={userToBlock?.status === 'blocked' ? 'Unblock User' : 'Block User'}
          message={
            userToBlock?.status === 'blocked' 
              ? `Are you sure you want to unblock ${userToBlock?.full_name || userToBlock?.email}? This will restore their listings to pending status for review.`
              : `Are you sure you want to block ${userToBlock?.full_name || userToBlock?.email}? This will immediately hide all their active listings from the marketplace.`
          }
          confirmText={userToBlock?.status === 'blocked' ? 'Unblock' : 'Block'}
          confirmButtonColor={
            userToBlock?.status === 'blocked'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          }
          isLoading={isBlocking}
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
