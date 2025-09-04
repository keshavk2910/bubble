import Image from 'next/image';

export default function ListingCard({ listing }) {
  const getCategoryBadgeStyle = (category) => {
    switch (category.toLowerCase()) {
      case 'featured':
        return 'bg-orange-500 text-white';
      case 'equipment':
        return 'bg-white/90 text-black';
      case 'business':
        return 'bg-white/90 text-black';
      case 'truck':
        return 'bg-white/90 text-black';
      default:
        return 'bg-white/90 text-black';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {listing.image ? (
          <Image
            src={listing.image}
            alt={listing.title}
            width={384}
            height={192}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200"></div>
        )}
        <span className={`absolute top-3 left-3 text-xs font-normal font-sans px-3 py-1 rounded-lg ${getCategoryBadgeStyle(listing.category)}`}>
          {listing.category}
        </span>
      </div>
      
      <div className="p-4">
        <h3 className="text-gray-700 text-lg font-normal font-sans leading-7 mb-2">
          {listing.title}
        </h3>
        
        <p className="text-green-600 text-xl font-medium font-sans leading-7 mb-2">
          ${listing.price.toLocaleString()}
        </p>
        
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-3.5 h-3.5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-600 text-sm font-normal font-sans leading-tight">
            {listing.location}
          </span>
        </div>
        
        <p className="text-gray-700 text-sm font-normal font-sans leading-tight">
          {listing.description}
        </p>
      </div>
    </div>
  );
}