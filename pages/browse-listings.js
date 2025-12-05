import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ListingCard from '../components/ListingCard';
import SearchFilters from '../components/SearchFilters';
import Layout from '@/components/Layout';
import Link from 'next/link';

export default function BrowseListings() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priceRange: '',
    location: '',
    condition: '',
    sort: 'newest',
  });

  // Initialize filters from URL parameters
  useEffect(() => {
    if (!router.isReady) return;
    
    const { search, category, priceRange, location, condition, sort } = router.query;
    
    setFilters({
      search: search || '',
      category: category || '',
      priceRange: priceRange || '',
      location: location || '',
      condition: condition || '',
      sort: sort || 'newest',
    });
  }, [router.isReady, router.query]);

  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 12,
    total_results: 0,
    total_pages: 0,
  });

  // Load listings from API when filters change
  useEffect(() => {
    const loadListings = async () => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams();

        if (filters.search) params.append('search', filters.search);
        if (filters.category && filters.category !== 'all')
          params.append('category', filters.category);
        if (filters.priceRange && filters.priceRange !== 'all')
          params.append('priceRange', filters.priceRange);
        if (filters.location) params.append('location', filters.location);
        if (filters.condition && filters.condition !== 'all')
          params.append('condition', filters.condition);
        if (filters.sort) params.append('sort', filters.sort);
        params.append('page', pagination.current_page.toString());
        params.append('limit', '12');

        const response = await fetch(`/api/public/listings?${params}`);

        if (response.ok) {
          const data = await response.json();
          setListings(data.listings);
          setPagination(data.pagination);
        } else {
          console.error('Failed to load listings');
          setListings([]);
        }
      } catch (error) {
        console.error('Load listings error:', error);
        setListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadListings();
  }, [filters, pagination.current_page]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, current_page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const Pagination = () => {
    if (pagination.total_pages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const currentPage = pagination.current_page;
    const totalPages = pagination.total_pages;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key='prev'
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-base font-normal font-sans leading-normal transition-colors ${
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        &lt;
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-normal font-sans leading-normal transition-colors ${
            i === currentPage
              ? 'bg-gray-900 text-white'
              : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key='next'
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-base font-normal font-sans leading-normal transition-colors ${
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        &gt;
      </button>
    );

    return (
      <div className='flex items-center justify-center gap-3 mt-12'>
        {pages}
      </div>
    );
  };

  return (
    <Layout>
      <Head>
        <title>Browse Listings - Bins Buy Sell</title>
        <meta
          name='description'
          content='Find pressure washing equipment, trucks, and businesses for sale. Filter by category, price, and location.'
        />
      </Head>
      <div className='max-w-7xl mx-auto px-6 py-8'>
        {/* Page Header */}
        <div className='mb-8'>
          <h1 className='text-gray-900 text-4xl font-medium font-sans leading-10 mb-4'>
            Find What You Need – Fast
          </h1>
        </div>

        {/* Search and Filters */}
        <div className='mb-8'>
          <SearchFilters
            onFilterChange={handleFilterChange}
            activeFilters={filters}
          />
        </div>

        {/* Results Count */}
        <div className='mb-6'>
          <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
            {isLoading ? (
              'Loading...'
            ) : (
              <>
                Showing {listings.length} of {pagination.total_results} result
                {pagination.total_results !== 1 ? 's' : ''}
                {filters.search && (
                  <span> for &ldquo;{filters.search}&rdquo;</span>
                )}
              </>
            )}
          </p>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8'>
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className='bg-white rounded-xl border border-gray-200 p-6 animate-pulse'
              >
                <div className='w-full h-48 bg-gray-200 rounded-lg mb-4'></div>
                <div className='h-4 bg-gray-200 rounded mb-2'></div>
                <div className='h-4 bg-gray-200 rounded w-3/4'></div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8'>
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listing/${listing.slug || listing.id}`}
                >
                  <ListingCard listing={listing} />
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <Pagination />
          </>
        ) : (
          <div className='text-center py-16'>
            <div className='w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center'>
              <svg
                className='w-12 h-12 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            </div>
            <h3 className='text-xl font-medium text-gray-900 mb-2'>
              No listings found
            </h3>
            <p className='text-gray-600 mb-6'>
              Try adjusting your search criteria or clearing some filters.
            </p>
            <button
              onClick={() =>
                setFilters({
                  search: '',
                  category: '',
                  priceRange: '',
                  location: '',
                  condition: '',
                  sort: 'newest',
                })
              }
              className='bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors'
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
