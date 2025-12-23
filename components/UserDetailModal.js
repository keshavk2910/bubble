import { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';

export default function UserDetailModal({ isOpen, onClose, user }) {
  const [userListings, setUserListings] = useState([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserListings();
    }
  }, [isOpen, user]);

  const fetchUserListings = async () => {
    setIsLoadingListings(true);
    try {
      const session = localStorage.getItem('supabase_session');
      if (!session) return;

      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const response = await fetch(
        `/api/admin/listings?user_id=${user.id}&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserListings(data.listings);
      }
    } catch (error) {
      console.error('Failed to fetch user listings:', error);
    } finally {
      setIsLoadingListings(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      case 'deleted':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div
      className='fixed inset-0 flex items-center justify-center p-4 z-50'
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
    >
      <div className='bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h2 className='text-xl font-semibold text-gray-900'>User Details</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <div className='overflow-y-auto max-h-[80vh]'>
          {/* User Information */}
          <div className='p-6 border-b border-gray-200'>
            <div className='flex items-start gap-6'>
              {/* Avatar */}
              <div className='w-16 h-16 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0'>
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt='User avatar'
                    width={64}
                    height={64}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center'>
                    <User className='w-8 h-8 text-white' />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <h3 className='text-lg font-medium text-gray-900 mb-1'>
                    {user.full_name || 'N/A'}
                  </h3>
                  {user.display_name &&
                    user.display_name !== user.full_name && (
                      <p className='text-sm text-gray-500 mb-2'>
                        @{user.display_name}
                      </p>
                    )}
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <Mail className='w-4 h-4' />
                      <span>{user.email}</span>
                      {user.email_verified && (
                        <span className='text-green-600 text-xs'>
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <Phone className='w-4 h-4' />
                      <span>{user.phone || 'N/A'}</span>
                      {user.phone_verified && (
                        <span className='text-green-600 text-xs'>
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <MapPin className='w-4 h-4' />
                    <span>
                      {user.country || 'N/A'}{' '}
                      {user.zip_code && `- ${user.zip_code}`}
                    </span>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <Calendar className='w-4 h-4' />
                    <span>
                      Joined{' '}
                      {formatDate(user.registration_date || user.created_at)}
                    </span>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <Package className='w-4 h-4' />
                    <span className='capitalize'>
                      {user.user_type || 'customer'}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        user.status
                      )}`}
                    >
                      <div className='w-1.5 h-1.5 bg-current rounded-full mr-1'></div>
                      <span className='capitalize'>
                        {user.status || 'active'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {user.address && (
              <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
                <p className='text-sm text-gray-700'>
                  <strong>Address:</strong> {user.address}
                </p>
              </div>
            )}
          </div>

          {/* User Listings */}
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-medium text-gray-900'>
                User Listings ({userListings.length})
              </h3>
              {isLoadingListings && (
                <div className='w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin'></div>
              )}
            </div>

            {isLoadingListings ? (
              <div className='text-center py-8'>
                <div className='w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2'></div>
                <p className='text-gray-500'>Loading listings...</p>
              </div>
            ) : userListings.length === 0 ? (
              <div className='text-center py-8'>
                <Package className='w-12 h-12 text-gray-300 mx-auto mb-2' />
                <p className='text-gray-500'>No listings found</p>
              </div>
            ) : (
              <div className='space-y-3'>
                {userListings.map((listing) => (
                  <div
                    key={listing.id}
                    className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors'
                  >
                    <div className='flex items-start gap-4'>
                      {/* Listing Image */}
                      <div className='w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0'>
                        {listing.main_image ? (
                          <Image
                            src={listing.main_image}
                            alt={listing.title}
                            width={64}
                            height={64}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center'>
                            <Package className='w-6 h-6 text-gray-400' />
                          </div>
                        )}
                      </div>

                      {/* Listing Info */}
                      <div className='flex-1'>
                        <div className='flex items-start justify-between'>
                          <div>
                            <h4 className='font-medium text-gray-900 mb-1'>
                              {listing.title}
                            </h4>
                            <p className='text-sm text-gray-600 mb-2'>
                              {listing.description?.substring(0, 100)}
                              {listing.description?.length > 100 && '...'}
                            </p>
                            <div className='flex items-center gap-4 text-xs text-gray-500'>
                              <span>
                                Created {formatDate(listing.created_at)}
                              </span>
                              <span className='capitalize'>
                                {listing.category}
                              </span>
                              {listing.price && (
                                <span>${listing.price?.toLocaleString()}</span>
                              )}
                            </div>
                          </div>

                          <div className='flex items-center gap-2 ml-4'>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                listing.status
                              )}`}
                            >
                              {listing.status}
                            </span>
                            <a
                              href={`/listing/${listing.slug || listing.id}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='p-1 text-gray-400 hover:text-green-600 transition-colors'
                              title='View listing'
                            >
                              <ExternalLink className='w-4 h-4' />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
