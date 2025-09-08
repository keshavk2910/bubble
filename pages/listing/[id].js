import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Heart,
  Flag,
  CheckCircle,
  Star,
} from 'lucide-react';
import Layout from '../../components/Layout';
import ReportListingModal from '../../components/ReportListingModal';

export default function ListingDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [listing, setListing] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;

      try {
        setIsLoading(true);

        console.log(`🔍 [PUBLIC] Fetching listing: ${id}`);
        // Fetch listing data from Supabase
        const response = await fetch(`/api/listings/${id}`);

        if (!response.ok) {
          console.log(
            `❌ [PUBLIC] Failed to fetch listing: ${response.status}`
          );
          throw new Error('Listing not found');
        }

        const data = await response.json();
        console.log(
          `✅ [PUBLIC] Listing fetched successfully:`,
          data.listing.title
        );
        setListing(data.listing);

        // Check if user is the owner and get user info
        const session = localStorage.getItem('supabase_session');
        if (session) {
          const sessionData = JSON.parse(session);

          console.log(`👤 [AUTH] Getting current user info`);
          // Get current user info
          const userResponse = await fetch('/api/me', {
            headers: {
              Authorization: `Bearer ${sessionData.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            setCurrentUser(userData.profile);
            const isOwner = userData.profile.id === data.listing.user_id;
            setIsOwner(isOwner);
            console.log(`👤 [AUTH] User is owner: ${isOwner}`);
          }

          console.log(`💾 [WISHLIST] Checking if listing is saved: ${id}`);
          // Check if listing is saved
          const savedResponse = await fetch(
            `/api/wishlists/check?listingId=${id}`,
            {
              headers: {
                Authorization: `Bearer ${sessionData.access_token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (savedResponse.ok) {
            const savedData = await savedResponse.json();
            setIsSaved(savedData.isSaved);
            console.log(
              `💾 [WISHLIST] Listing saved status: ${savedData.isSaved}`
            );
          } else {
            console.log(
              `❌ [WISHLIST] Failed to check saved status: ${savedResponse.status}`
            );
          }
        }
      } catch (error) {
        console.error('Error fetching listing:', error);

        // If listing is not found, check if user owns an inactive listing
        const session = localStorage.getItem('supabase_session');
        if (session) {
          try {
            const sessionData = JSON.parse(session);
            console.log(
              `🔍 [OWNER] Checking for inactive listing access: ${id}`
            );
            const ownerResponse = await fetch(
              `/api/listings/${id}?includeInactive=true`,
              {
                headers: {
                  Authorization: `Bearer ${sessionData.access_token}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (ownerResponse.ok) {
              const ownerData = await ownerResponse.json();
              console.log(
                `✅ [OWNER] Inactive listing accessed successfully:`,
                ownerData.listing.title
              );
              setListing(ownerData.listing);
              setIsOwner(true);
              setCurrentUser({ id: ownerData.listing.user_id });
            } else {
              console.log(
                `❌ [OWNER] Failed to access inactive listing: ${ownerResponse.status}`
              );
              setListing(null);
            }
          } catch (ownerError) {
            console.error('Error checking owner listing:', ownerError);
            setListing(null);
          }
        } else {
          setListing(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? listing.images?.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === listing.images?.length - 1 ? 0 : prev + 1
    );
  };

  const handleSaveListing = async () => {
    const session = localStorage.getItem('supabase_session');
    if (!session) {
      router.push('/sign-in?redirect=' + router.asPath);
      return;
    }

    try {
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const response = await fetch('/api/wishlists', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId: id }),
      });

      if (response.ok) {
        setIsSaved(!isSaved);
      }
    } catch (error) {
      console.error('Error saving listing:', error);
    }
  };

  const handleContactSeller = async () => {
    try {
      // Check if user is logged in
      const session = localStorage.getItem('supabase_session');
      if (!session) {
        // Redirect to sign in with return URL
        router.push(`/sign-in?redirect=${encodeURIComponent(router.asPath)}`);
        return;
      }

      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      // Create or get existing conversation
      const response = await fetch('/api/conversations/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listing.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to messages page with conversation
        router.push(`/dashboard/messages?conversation=${data.conversationId}`);
      } else {
        // Handle specific errors
        if (data.error === 'Cannot contact yourself') {
          alert('You cannot contact yourself about your own listing.');
        } else if (data.error === 'Listing not available') {
          alert('This listing is not currently available for inquiries.');
        } else {
          alert(data.details || 'Failed to start conversation. Please try again.');
        }
      }
    } catch (error) {
      console.error('Contact seller error:', error);
      alert('Failed to contact seller. Please check your connection and try again.');
    }
  };

  const handleReportListing = () => {
    setShowReportModal(true);
  };

  const [relatedListings, setRelatedListings] = useState([]);

  // Fetch related listings
  useEffect(() => {
    const fetchRelatedListings = async () => {
      if (!listing?.category) return;

      try {
        console.log(
          `🔗 [RELATED] Fetching related listings for category: ${listing.category}`
        );
        const response = await fetch(
          `/api/listings/related?category=${listing.category}&excludeId=${id}&limit=3`
        );
        if (response.ok) {
          const data = await response.json();
          setRelatedListings(data.listings);
          console.log(
            `✅ [RELATED] Found ${data.listings.length} related listings`
          );
        } else {
          console.log(
            `❌ [RELATED] Failed to fetch related listings: ${response.status}`
          );
        }
      } catch (error) {
        console.error('Error fetching related listings:', error);
      }
    };

    if (listing) {
      fetchRelatedListings();
    }
  }, [listing, id]);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading listing...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Listing Not Found
          </h1>
          <p className='text-gray-600 mb-4'>
            The listing you&apos;re looking for doesn&apos;t exist or is no
            longer available.
          </p>
          <button
            onClick={() => router.push('/browse-listings')}
            className='bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors'
          >
            Browse All Listings
          </button>
        </div>
      </div>
    );
  }

  // If listing is inactive and user is not the owner, show not found
  if (listing.status !== 'active' && !isOwner) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Listing Not Available
          </h1>
          <p className='text-gray-600 mb-4'>
            This listing is currently not available for public viewing.
          </p>
          <button
            onClick={() => router.push('/browse-listings')}
            className='bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors'
          >
            Browse All Listings
          </button>
        </div>
      </div>
    );
  }
  console.log('listing.images?.length', listing.images?.length);
  return (
    <Layout>
      <div className='w-full bg-white overflow-hidden'>
      {/* Inactive Listing Warning Banner for Owner */}
      {isOwner && listing?.status !== 'active' && (
        <div className='sticky top-0 w-full bg-yellow-500 text-white py-4 px-6 z-50'>
          <div className='max-w-7xl mx-auto flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center'>
                <span className='text-yellow-100 text-sm'>!</span>
              </div>
              <div>
                <h3 className='font-semibold text-base'>
                  {listing.status === 'pending'
                    ? 'Listing Pending Approval'
                    : 'Listing Not Active'}
                </h3>
                <p className='text-yellow-100 text-sm'>
                  {listing.status === 'pending'
                    ? 'Your listing is under review by our admin team and will be visible to buyers once approved.'
                    : 'This listing is currently inactive and not visible to other users.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/user')}
              className='bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors text-sm'
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className='max-w-7xl mx-auto px-6 py-8'>
        {/* Title and Meta Info */}
        <div className='mb-8'>
          <h1 className='text-gray-900 text-4xl font-medium font-sans leading-10 mb-6'>
            {listing.title}
          </h1>

          <div className='flex items-center gap-6 flex-wrap'>
            <div className='text-gray-900 text-2xl font-normal font-sans leading-loose'>
              ${listing.price?.toLocaleString()}
            </div>

            <div className='flex items-center gap-2'>
              <MapPin className='w-4 h-4 text-gray-600' />
              <span className='text-gray-600 text-base font-normal font-sans leading-normal'>
                ZIP: {listing.zip_code}
              </span>
            </div>

            <div className='bg-green-600/10 rounded-full px-3 py-1'>
              <span className='text-green-600 text-sm font-normal font-sans leading-tight'>
                {formatCategoryDisplay(listing.category)}
              </span>
            </div>

            <span className='text-gray-600 text-base font-normal font-sans leading-normal'>
              Listed on{' '}
              {new Date(listing.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column - Images and Description */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Main Image Carousel */}
            <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
              <div className='relative'>
                {/* Main Image */}
                <div className='relative aspect-[820/400] overflow-hidden'>
                  <Image
                    src={listing.images?.[currentImageIndex]?.image_url}
                    alt='Listing image'
                    fill
                    className='object-cover'
                  />

                  {/* Navigation Arrows */}
                  <button
                    onClick={handlePreviousImage}
                    className='absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white/90 transition-colors'
                  >
                    <ChevronLeft className='w-6 h-6 text-gray-700' />
                  </button>

                  <button
                    onClick={handleNextImage}
                    className='absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white/90 transition-colors'
                  >
                    <ChevronRight className='w-6 h-6 text-gray-700' />
                  </button>

                  {/* Image Counter */}
                  <div className='absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 rounded-full px-3 py-1'>
                    <span className='text-black text-sm font-normal font-sans leading-tight'>
                      {currentImageIndex + 1} / {listing?.images?.length || 1}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail Images */}
            {listing.images && listing.images.length > 1 && (
              <div className='flex gap-4 overflow-x-auto pb-2'>
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-24 h-24 rounded-lg border-2 overflow-hidden transition-colors ${
                      index === currentImageIndex
                        ? 'border-green-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image.image_url}
                      alt={`Thumbnail ${index + 1}`}
                      width={96}
                      height={96}
                      className='w-full h-full object-cover'
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className='space-y-6'>
              <h2 className='text-gray-700 text-xl font-normal font-sans leading-7'>
                Description
              </h2>
              <div className='text-gray-700 text-base font-normal font-sans leading-normal whitespace-pre-line'>
                {listing.description}
              </div>
            </div>

            {/* You Might Also Like */}
            <div className='space-y-6'>
              <h2 className='text-gray-700 text-xl font-normal font-sans leading-7'>
                You Might Also Like
              </h2>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {relatedListings.map((item) => (
                  <div
                    key={item.id}
                    className='bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'
                  >
                    <div className='relative'>
                      <Image
                        src={item.main_image || '/FRAME.png'}
                        alt={item.title}
                        width={284}
                        height={160}
                        className='w-full h-40 object-cover'
                      />
                      <span className='absolute top-3 left-3 bg-green-600/10 text-green-600 text-xs font-normal font-sans px-2 py-1 rounded-full'>
                        {formatCategoryDisplay(item.category)}
                      </span>
                    </div>

                    <div className='p-4'>
                      <h3 className='text-gray-700 text-lg font-normal font-sans leading-7 mb-2'>
                        {item.title}
                      </h3>
                      <p className='text-green-600 text-xl font-medium font-sans leading-7 mb-2'>
                        ${item.price?.toLocaleString()}
                      </p>
                      <div className='flex items-center gap-2 mb-3'>
                        <MapPin className='w-3.5 h-3.5 text-gray-600' />
                        <span className='text-gray-600 text-sm font-normal font-sans leading-tight'>
                          ZIP: {item.zip_code}
                        </span>
                      </div>
                      <p className='text-gray-700 text-sm font-normal font-sans leading-tight'>
                        {item.description?.substring(0, 100)}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Seller Info and Actions */}
          <div className='space-y-6'>
            {/* Seller Card */}
            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-12 h-12 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center'>
                  {listing.user?.avatar_url ? (
                    <Image
                      src={listing.user.avatar_url}
                      alt="Seller avatar"
                      width={48}
                      height={48}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <User className='w-6 h-6 text-gray-600' />
                  )}
                </div>
                <div>
                  <h3 className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    {listing.user?.display_name ||
                      listing.user?.full_name ||
                      'Anonymous Seller'}
                  </h3>
                  <div className='flex items-center gap-1'>
                    <CheckCircle className='w-4 h-4 text-green-600' />
                    <span className='text-gray-600 text-sm font-normal font-sans leading-tight'>
                      {listing.user?.phone_verified &&
                      listing.user?.email_verified
                        ? 'Verified Seller'
                        : 'Unverified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='space-y-3'>
                <button
                  onClick={handleContactSeller}
                  className='w-full bg-green-600 text-white text-base font-normal font-sans leading-normal py-3 rounded-lg hover:bg-green-700 transition-colors'
                >
                  Contact Seller
                </button>

                <button
                  onClick={handleSaveListing}
                  className={`w-full border text-base font-normal font-sans leading-normal py-3 rounded-lg transition-colors ${
                    isSaved
                      ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className='flex items-center justify-center gap-2'>
                    <Heart
                      className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`}
                    />
                    {isSaved ? 'Saved' : 'Save Listing'}
                  </div>
                </button>
              </div>
            </div>

            {/* Seller Information */}
            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <h3 className='text-gray-700 text-lg font-normal font-sans leading-7 mb-4'>
                Seller Information
              </h3>

              <div className='space-y-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    Seller Type:
                  </span>
                  <span className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    {listing.user?.user_type === 'service_provider'
                      ? 'Service Provider'
                      : 'Individual'}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    Member Since:
                  </span>
                  <span className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    {new Date(
                      listing.user?.registration_date
                    ).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    Last Seen:
                  </span>
                  <span className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    {getLastSeenText(listing.user?.updated_at)}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    Verification:
                  </span>
                  <span className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    {getVerificationStatus(listing.user)}
                  </span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    Rating:
                  </span>
                  <div className='flex items-center gap-1'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className='w-4 h-4 text-yellow-400 fill-current'
                      />
                    ))}
                    <span className='text-gray-700 text-base font-normal font-sans leading-normal ml-1'>
                      (24)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Tips */}
            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <h3 className='text-gray-700 text-lg font-normal font-sans leading-7 mb-4'>
                Safety Tips
              </h3>

              <ul className='space-y-3 text-gray-700 text-base font-normal font-sans leading-normal'>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 flex-shrink-0'></div>
                  <span>Meet in a safe, public location</span>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 flex-shrink-0'></div>
                  <span>Inspect equipment thoroughly before purchase</span>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 flex-shrink-0'></div>
                  <span>Verify all specifications and documentation</span>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 flex-shrink-0'></div>
                  <span>Never wire money or use gift cards for payment</span>
                </li>
              </ul>

              <div className='mt-6 pt-6 border-t border-gray-200'>
                <button
                  onClick={handleReportListing}
                  className='flex items-center gap-2 text-red-500 text-base font-normal font-sans leading-normal hover:text-red-600 transition-colors'
                >
                  <Flag className='w-4 h-4' />
                  Report This Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Report Listing Modal */}
      <ReportListingModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        listingTitle={listing?.title}
        listingId={listing?.id}
      />
    </Layout>
  );
}

// Helper functions
function formatCategoryDisplay(category) {
  const categoryMap = {
    equipment: 'Equipment',
    'trucks-vehicles': 'Trucks & Vehicles',
    'complete-business': 'Complete Business',
    'parts-accessories': 'Parts & Accessories',
  };
  return categoryMap[category] || category;
}

function getLastSeenText(updatedAt) {
  if (!updatedAt) return 'Unknown';

  const now = new Date();
  const lastSeen = new Date(updatedAt);
  const diffMs = now - lastSeen;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Less than 1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  return lastSeen.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
}

function getVerificationStatus(user) {
  if (!user) return 'Unknown';

  const verifications = [];
  if (user.phone_verified) verifications.push('Phone');
  if (user.email_verified) verifications.push('Email');

  return verifications.length > 0 ? verifications.join(' & ') : 'Unverified';
}
