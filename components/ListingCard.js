import Image from 'next/image';

export default function ListingCard({ listing }) {
  // Remove debug log for production
  // console.log(listing);

  const getCategoryBadgeStyle = (category) => {
    switch (category?.toLowerCase()) {
      case 'equipment':
        return 'bg-white/90 text-black';
      case 'complete-business':
        return 'bg-white/90 text-black';
      case 'trucks-vehicles':
        return 'bg-white/90 text-black';
      case 'parts-accessories':
        return 'bg-white/90 text-black';
      default:
        return 'bg-white/90 text-black';
    }
  };

  // Compose location as "city, zip" if available, fallback to listing.location
  const locationDisplay =
    listing.city && listing.zip_code
      ? `${listing.city}, ${listing.zip_code}`
      : listing.location || '';

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'>
      <div className='relative'>
        {listing.listing_images && listing.listing_images[0]?.image_url ? (
          <Image
            src={listing.listing_images[0].image_url}
            alt={listing.title}
            width={384}
            height={192}
            className='w-full h-48 object-cover'
          />
        ) : (
          <div className='w-full h-48 bg-gray-200 flex items-center justify-center'>
            <span className='text-gray-400 text-sm'>No Image</span>
          </div>
        )}

        {/* Featured badge if listing.featured is true */}
        {listing.featured && (
          <span className='absolute top-3 left-3 bg-green-600 text-white text-xs font-semibold font-sans px-3 py-1 rounded-lg z-10 shadow'>
            FEATURED
          </span>
        )}

        {/* Category badge, shifted down if featured */}
        <span
          className={`absolute left-3 text-xs font-normal font-sans px-3 py-1 rounded-lg ${getCategoryBadgeStyle(
            listing.category
          )} ${listing.featured ? 'top-11' : 'top-3'}`}
        >
          {listing.category?.charAt(0).toUpperCase() + listing.category?.slice(1)}
        </span>
      </div>

      <div className='p-4'>
        <h3 className='text-gray-700 text-lg font-normal font-sans leading-7 mb-2'>
          {listing.title}
        </h3>

        <p className='text-green-600 text-xl font-medium font-sans leading-7 mb-2'>
          ${listing.price?.toLocaleString()}
        </p>

        <div className='flex items-center gap-2 mb-3'>
          <svg
            className='w-3.5 h-3.5 text-gray-600'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
              clipRule='evenodd'
            />
          </svg>
          <span className='text-gray-600 text-sm font-normal font-sans leading-tight'>
            {locationDisplay}
          </span>
        </div>

        <p className='text-gray-700 text-sm font-normal font-sans leading-tight'>
          {listing.description?.substring(0, 100)}...
        </p>
      </div>
    </div>
  );
}
